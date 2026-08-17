import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import resumeRestoredCallRecordingLogicFunction, {
  resumeRestoredCallRecordingHandler,
} from 'src/logic-functions/resume-restored-call-recording';

const mutationMock = vi.hoisted(() => vi.fn());
const resumePendingCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    mutation = mutationMock;
  },
}));

vi.mock(
  'src/logic-functions/flows/resume-pending-call-recording.util',
  () => ({
    resumePendingCallRecording: resumePendingCallRecordingMock,
  }),
);

const fetchMock = vi.fn();
const BOT_SCHEDULE_ATTEMPT_ID = 'e98e8dcc-5db1-485c-a68f-86cbd3a59faf';
const WORKSPACE_ID = '123e4567-e89b-42d3-a456-426614174000';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

describe('resumeRestoredCallRecordingHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(undefined, { status: 204 }));
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    });
    resumePendingCallRecordingMock.mockReset();
    resumePendingCallRecordingMock.mockResolvedValue({ status: 'scheduled' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('removes stale ownership before resuming a restored recording', async () => {
    const result = await resumeRestoredCallRecordingHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        after: {
          status: 'JOINING',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'recall-bot-1',
          botScheduleAttemptId: BOT_SCHEDULE_ATTEMPT_ID,
          botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
          botScheduleIdempotencyKey: 'schedule-attempt-1',
        },
      },
    } as never);

    expect(result).toEqual({
      removedExternalBotIds: ['recall-bot-1'],
      result: {
        status: 'deferred',
        reason: 'bot state reset; the update trigger will resume scheduling',
      },
    });
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            deletedAt: { is: 'NULL' },
            recordingRequestStatus: { eq: 'REQUESTED' },
            externalBotId: { eq: 'recall-bot-1' },
            botScheduleAttemptId: { eq: BOT_SCHEDULE_ATTEMPT_ID },
            botScheduleAttemptedAt: {
              eq: '2026-01-01T10:00:00.000Z',
            },
            botScheduleIdempotencyKey: { eq: 'schedule-attempt-1' },
          },
          data: {
            status: 'SCHEDULED',
            externalBotId: null,
            botScheduleAttemptId: null,
            botScheduleAttemptedAt: null,
            botScheduleIdempotencyKey: null,
          },
        },
        id: true,
      },
    });
    expect(resumePendingCallRecordingMock).not.toHaveBeenCalled();
  });

  it('does not touch completed recordings when they are restored', async () => {
    const result = await resumeRestoredCallRecordingHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        after: {
          status: 'COMPLETED',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'recall-bot-1',
        },
      },
    } as never);

    expect(result).toEqual({
      removedExternalBotIds: [],
      result: {
        status: 'skipped',
        reason: 'call recording does not have a removable bot state',
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(resumePendingCallRecordingMock).not.toHaveBeenCalled();
  });

  it('removes an active bot without retrying a restored failed recording', async () => {
    const result = await resumeRestoredCallRecordingHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        after: {
          status: 'FAILED',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'recall-bot-1',
          botScheduleAttemptId: BOT_SCHEDULE_ATTEMPT_ID,
          botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
          botScheduleIdempotencyKey: 'schedule-attempt-1',
        },
      },
    } as never);

    expect(result).toEqual({
      removedExternalBotIds: ['recall-bot-1'],
      result: {
        status: 'skipped',
        reason: 'restored failed call recording remains failed',
      },
    });
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        updateCallRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            data: {
              externalBotId: null,
              botScheduleAttemptId: null,
              botScheduleAttemptedAt: null,
              botScheduleIdempotencyKey: null,
            },
          }),
        }),
      }),
    );
    expect(resumePendingCallRecordingMock).not.toHaveBeenCalled();
  });

  it('does not resume when the restored row changed during cleanup', async () => {
    mutationMock.mockResolvedValue({ updateCallRecordings: [] });

    const result = await resumeRestoredCallRecordingHandler({
      name: 'callRecording.restored',
      recordId: 'call-recording-1',
      properties: {
        after: {
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'recall-bot-1',
        },
      },
    } as never);

    expect(result).toEqual({
      removedExternalBotIds: ['recall-bot-1'],
      result: {
        status: 'deferred',
        reason: 'call recording changed while its old bot was removed',
      },
    });
    expect(resumePendingCallRecordingMock).not.toHaveBeenCalled();
  });

  it('defers restoration while its claimed bot may still be in flight', async () => {
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ next: null, results: [] }), {
        status: 200,
      }),
    );

    await expect(
      resumeRestoredCallRecordingHandler({
        name: 'callRecording.restored',
        recordId: 'call-recording-1',
        properties: {
          after: {
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            externalBotId: null,
            botScheduleAttemptId: BOT_SCHEDULE_ATTEMPT_ID,
            botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
            botScheduleIdempotencyKey: 'schedule-attempt-1',
          },
        },
      } as never),
    ).rejects.toThrow('Attempted Recall bot is not visible yet');

    expect(mutationMock).not.toHaveBeenCalled();
    expect(resumePendingCallRecordingMock).not.toHaveBeenCalled();
  });

  it('subscribes to CallRecording restoration events', () => {
    expect(
      resumeRestoredCallRecordingLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({ eventName: 'callRecording.restored' });
  });
});
