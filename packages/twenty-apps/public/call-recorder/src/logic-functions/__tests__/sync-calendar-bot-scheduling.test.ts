import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncCalendarBotSchedulingHandler } from 'src/logic-functions/sync-calendar-bot-scheduling';
import {
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const enqueueJobsMock = vi.hoisted(() => vi.fn());
vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));

describe('syncCalendarBotSchedulingHandler', () => {
  beforeEach(() => {
    vi.stubEnv('CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED', 'false');
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('persists cancellation and enqueues cleanup before a recovery enqueue failure', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              callRecordings: {
                edges: [
                  {
                    node: {
                      id: 'recording',
                      status: 'SCHEDULED',
                      recordingRequestStatus: 'REQUESTED',
                      externalBotId: 'bot',
                    },
                  },
                ],
                pageInfo: { hasNextPage: false },
              },
              updateCallRecordings: [{ id: 'recording' }],
            },
          }),
        ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const enqueueError = new Error('follow-up queue unavailable');
    enqueueJobsMock.mockImplementation(
      async ({ logicFunctionUniversalIdentifier }) => {
        if (
          logicFunctionUniversalIdentifier ===
          FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
        ) {
          throw enqueueError;
        }
        return { enqueued: true };
      },
    );

    await expect(syncCalendarBotSchedulingHandler()).rejects.toBe(enqueueError);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: expect.stringContaining('CANCELED') }),
    );
    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('still arms recovery when the cancellation cleanup enqueue fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              data: {
                callRecordings: {
                  edges: [
                    {
                      node: {
                        id: 'recording',
                        status: 'SCHEDULED',
                        recordingRequestStatus: 'REQUESTED',
                      },
                    },
                  ],
                  pageInfo: { hasNextPage: false },
                },
                updateCallRecordings: [{ id: 'recording' }],
              },
            }),
          ),
      ),
    );
    const enqueueError = new Error('cleanup unavailable');
    enqueueJobsMock
      .mockRejectedValueOnce(enqueueError)
      .mockResolvedValue({ enqueued: true });

    await expect(syncCalendarBotSchedulingHandler()).rejects.toBe(enqueueError);
    expect(enqueueJobsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });
});
