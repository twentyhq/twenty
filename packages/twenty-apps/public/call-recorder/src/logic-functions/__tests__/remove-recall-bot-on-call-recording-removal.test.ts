import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import removeRecallBotOnCallRecordingDeletionLogicFunction, {
  removeRecallBotOnCallRecordingDeletionHandler,
} from 'src/logic-functions/remove-recall-bot-on-call-recording-deletion';
import removeRecallBotOnCallRecordingDestructionLogicFunction, {
  removeRecallBotOnCallRecordingDestructionHandler,
} from 'src/logic-functions/remove-recall-bot-on-call-recording-destruction';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

const RECALL_BOT_URL =
  'https://us-west-2.recall.ai/api/v1/bot/recall-bot-1/';
const WORKSPACE_ID = '123e4567-e89b-42d3-a456-426614174000';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

type CallRecordingDeletionEvent = Parameters<
  typeof removeRecallBotOnCallRecordingDeletionHandler
>[0];
type CallRecordingDeletionEventRecord =
  CallRecordingDeletionEvent['properties']['before'];

const buildCallRecordingDeletionEvent = (
  callRecording: Omit<CallRecordingDeletionEventRecord, 'id'>,
): CallRecordingDeletionEvent => {
  const callRecordingEventRecord = {
    id: 'call-recording-1',
    ...callRecording,
  };

  return {
    recordId: callRecordingEventRecord.id,
    properties: {
      before: callRecordingEventRecord,
      after: callRecordingEventRecord,
      updatedFields: [],
      diff: {},
    },
  };
};

type CallRecordingDestructionEvent = Parameters<
  typeof removeRecallBotOnCallRecordingDestructionHandler
>[0];
type CallRecordingDestructionEventRecord =
  CallRecordingDestructionEvent['properties']['before'];

const buildCallRecordingDestructionEvent = (
  callRecording: Omit<CallRecordingDestructionEventRecord, 'id'>,
): CallRecordingDestructionEvent => ({
  recordId: 'call-recording-1',
  properties: {
    before: {
      id: 'call-recording-1',
      ...callRecording,
    },
  },
});

describe('removeRecallBotOnCallRecordingDeletionHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(undefined, { status: 204 }));
    queryMock.mockReset();
    queryMock.mockResolvedValue({
      callRecordings: buildConnection([{ id: 'call-recording-1' }]),
    });
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('removes a known bot on deletion without listing Recall bots', async () => {
    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        botScheduleIdempotencyKey: 'schedule-attempt-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              id: { eq: 'call-recording-1' },
              deletedAt: { is: 'NOT_NULL' },
            },
          }),
        }),
      }),
    );
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            or: [
              { deletedAt: { is: 'NULL' } },
              { deletedAt: { is: 'NOT_NULL' } },
            ],
            externalBotId: { eq: 'recall-bot-1' },
            botScheduleAttemptId: { is: 'NULL' },
            botScheduleAttemptedAt: {
              eq: '2026-01-01T10:00:00.000Z',
            },
            botScheduleIdempotencyKey: { eq: 'schedule-attempt-1' },
          },
          data: {
            externalBotId: null,
            botScheduleAttemptId: null,
            botScheduleAttemptedAt: null,
            botScheduleIdempotencyKey: null,
          },
        },
        id: true,
      },
    });
  });

  it('skips a stale deletion retry after the recording was restored', async () => {
    queryMock.mockResolvedValue({ callRecordings: buildConnection([]) });

    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses a recording-scoped lookup when an attempted bot has no stored id', async () => {
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            next: null,
            results: [
              {
                id: 'recall-bot-1',
                metadata: {
                  twentyWorkspaceId: WORKSPACE_ID,
                  twentyCallRecordingId: 'call-recording-1',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(undefined, { status: 204 }));

    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'SCHEDULED',
        externalBotId: null,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        botScheduleIdempotencyKey: 'schedule-attempt-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const listUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(listUrl.pathname).toBe('/api/v1/bot/');
    expect(listUrl.searchParams.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(listUrl.searchParams.get('metadata__twentyCallRecordingId')).toBe(
      'call-recording-1',
    );
  });

  it('removes only the bot from the deleted recording schedule attempt', async () => {
    const botScheduleAttemptId = '6e850751-df99-4c8b-b56f-2ec44bcbbcac';

    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            next: null,
            results: [
              {
                id: 'recall-bot-1',
                metadata: {
                  twentyWorkspaceId: WORKSPACE_ID,
                  twentyCallRecordingId: 'call-recording-1',
                  twentyBotScheduleAttemptId: botScheduleAttemptId,
                },
              },
              {
                id: 'recall-bot-replacement',
                metadata: {
                  twentyWorkspaceId: WORKSPACE_ID,
                  twentyCallRecordingId: 'call-recording-1',
                  twentyBotScheduleAttemptId:
                    '0d5c00a9-3bb3-4f20-b74f-b67262916e7f',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(undefined, { status: 204 }));

    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'SCHEDULED',
        externalBotId: null,
        botScheduleAttemptId,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        botScheduleIdempotencyKey: 'schedule-attempt-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    const listUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(
      listUrl.searchParams.get('metadata__twentyBotScheduleAttemptId'),
    ).toBe(botScheduleAttemptId);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('recall-bot-replacement'),
      expect.anything(),
    );
  });

  it('does not call Recall when scheduling was never attempted', async () => {
    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'SCHEDULED',
        externalBotId: null,
        botScheduleAttemptedAt: null,
        botScheduleIdempotencyKey: null,
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not retry cleanup for a completed recording with old attempt markers', async () => {
    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'COMPLETED',
        externalBotId: null,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
        botScheduleIdempotencyKey: 'schedule-attempt-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when Recall cannot remove the bot so the event job can retry', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'cannot remove bot' }), {
        status: 400,
      }),
    );

    await expect(
      removeRecallBotOnCallRecordingDeletionHandler(
        buildCallRecordingDeletionEvent({
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
        }),
      ),
    ).rejects.toThrow('Failed to remove Recall bot recall-bot-1');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries an ambiguous removal when the in-flight bot is not visible yet', async () => {
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ next: null, results: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            next: null,
            results: [
              {
                id: 'recall-bot-1',
                metadata: {
                  twentyWorkspaceId: WORKSPACE_ID,
                  twentyCallRecordingId: 'call-recording-1',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(undefined, { status: 204 }));
    const event = buildCallRecordingDeletionEvent({
      status: 'SCHEDULED',
      externalBotId: null,
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });

    await expect(
      removeRecallBotOnCallRecordingDeletionHandler(event),
    ).rejects.toThrow('Attempted Recall bot is not visible yet');
    await expect(
      removeRecallBotOnCallRecordingDeletionHandler(event),
    ).resolves.toEqual({ removedExternalBotIds: ['recall-bot-1'] });
  });

  it('removes a bot from a failed recording because Recall may still be in the call', async () => {
    const result = await removeRecallBotOnCallRecordingDeletionHandler(
      buildCallRecordingDeletionEvent({
        status: 'FAILED',
        externalBotId: 'recall-bot-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('subscribes to CallRecording deletion events', () => {
    expect(
      removeRecallBotOnCallRecordingDeletionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.deleted' });
  });

  it('removes the bot from the before snapshot when a recording is destroyed', async () => {
    const result = await removeRecallBotOnCallRecordingDestructionHandler(
      buildCallRecordingDestructionEvent({
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
      }),
    );

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(
      removeRecallBotOnCallRecordingDestructionLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.destroyed' });
  });
});
