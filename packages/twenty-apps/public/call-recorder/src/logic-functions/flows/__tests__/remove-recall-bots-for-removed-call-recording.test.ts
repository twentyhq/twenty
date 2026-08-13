import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { removeRecallBotsForRemovedCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util';

const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const CALL_RECORDING_ID = '123e4567-e89b-42d3-a456-426614174001';
const BASE_URL = 'https://us-west-2.recall.ai/api/v1';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

describe('removeRecallBotsForRemovedCallRecording', () => {
  const fetchMock = vi.fn();
  const client = {
    mutation: vi.fn(async () => ({ updateCallRecordings: [] })),
  } as unknown as CoreApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('removes the exact bot without listing workspace bots', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: CALL_RECORDING_ID,
      externalBotId: 'recall-bot-1',
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('does nothing when bot scheduling was never attempted', async () => {
    const result = await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: CALL_RECORDING_ID,
    });

    expect(result).toEqual({ removedExternalBotIds: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('removes an exact bot without requiring a scheduling-attempt marker', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: CALL_RECORDING_ID,
      externalBotId: 'recall-bot-1',
    });

    expect(result).toEqual({ removedExternalBotIds: ['recall-bot-1'] });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('finds an attempted bot by exact routing metadata when its id was never written back', async () => {
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: RequestInit) => {
        if (requestInit?.method === 'DELETE') {
          return new Response(null, { status: 204 });
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return new Response(
            JSON.stringify({
              next: null,
              results: [
                {
                  id: 'recall-bot-recovered',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: CALL_RECORDING_ID,
                  },
                },
                {
                  id: 'unrelated-bot',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId:
                      '123e4567-e89b-42d3-a456-426614174999',
                  },
                },
              ],
            }),
            { status: 200 },
          );
        }

        throw new Error(`Unhandled fetch in test: ${requestUrl}`);
      },
    );

    const result = await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: CALL_RECORDING_ID,
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });

    expect(result).toEqual({
      removedExternalBotIds: ['recall-bot-recovered'],
    });
    const listRequestUrl = fetchMock.mock.calls[0][0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;
    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(listRequestParameters.get('metadata__twentyCallRecordingId')).toBe(
      CALL_RECORDING_ID,
    );
    expect(listRequestParameters.getAll('status')).toEqual([
      'ready',
      'joining_call',
      'in_waiting_room',
      'in_call_not_recording',
      'recording_permission_allowed',
      'recording_permission_denied',
      'in_call_recording',
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-recovered/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      `${BASE_URL}/bot/unrelated-bot/`,
      expect.anything(),
    );
  });

  it('throws when Recall removal fails so the database-event job retries', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'cannot remove bot' }), {
        status: 400,
      }),
    );

    await expect(
      removeRecallBotsForRemovedCallRecording({
        client,
        callRecordingId: CALL_RECORDING_ID,
        externalBotId: 'recall-bot-1',
      }),
    ).rejects.toThrow('Failed to remove Recall bot recall-bot-1');
  });

  it('throws when the exact metadata lookup fails', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'lookup failed' }), {
        status: 400,
      }),
    );

    await expect(
      removeRecallBotsForRemovedCallRecording({
        client,
        callRecordingId: CALL_RECORDING_ID,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(
      `Failed to find Recall bots for removed CallRecording ${CALL_RECORDING_ID}`,
    );
  });

  it('keeps a recent unresolved attempt retryable when no bot is visible yet', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:01:00.000Z'));
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ next: null, results: [] }), {
        status: 200,
      }),
    );

    await expect(
      removeRecallBotsForRemovedCallRecording({
        client,
        callRecordingId: CALL_RECORDING_ID,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
      }),
    ).rejects.toThrow('Recall bot creation is still settling');

    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('removes fetched bots before reporting a truncated exact lookup', async () => {
    let listPageCount = 0;

    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: RequestInit) => {
        if (requestInit?.method === 'DELETE') {
          return new Response(null, { status: 204 });
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          listPageCount += 1;

          return new Response(
            JSON.stringify({
              next: `${BASE_URL}/bot/?cursor=page-${listPageCount + 1}`,
              results:
                listPageCount === 1
                  ? [
                      {
                        id: 'recall-bot-fetched',
                        metadata: {
                          twentyWorkspaceId: WORKSPACE_ID,
                          twentyCallRecordingId: CALL_RECORDING_ID,
                        },
                      },
                    ]
                  : [],
            }),
            { status: 200 },
          );
        }

        throw new Error(`Unhandled fetch in test: ${requestUrl}`);
      },
    );

    await expect(
      removeRecallBotsForRemovedCallRecording({
        client,
        callRecordingId: CALL_RECORDING_ID,
        botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(
      `Failed to find every Recall bot for removed CallRecording ${CALL_RECORDING_ID}`,
    );

    expect(listPageCount).toBe(10);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-fetched/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('does not command Recall after the bot lifecycle has finished', async () => {
    const result = await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: CALL_RECORDING_ID,
      status: 'COMPLETED',
      externalBotId: 'recall-bot-1',
      botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
    });

    expect(result).toEqual({ removedExternalBotIds: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });
});
