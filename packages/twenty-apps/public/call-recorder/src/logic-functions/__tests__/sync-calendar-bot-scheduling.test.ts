import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncCalendarBotSchedulingHandler } from 'src/logic-functions/sync-calendar-bot-scheduling';
import {
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const { enqueueJobsMock, queryMock, mutationMock } = vi.hoisted(() => ({
  enqueueJobsMock: vi.fn(),
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));
vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('syncCalendarBotSchedulingHandler', () => {
  beforeEach(() => {
    queryMock.mockReset().mockResolvedValue({
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
    });
    mutationMock.mockReset().mockResolvedValue({
      updateCallRecordings: [{ id: 'recording' }],
    });
    vi.stubEnv('CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED', 'false');
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('persists cancellation and enqueues cleanup before a recovery enqueue failure', async () => {
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

    await expect(syncCalendarBotSchedulingHandler()).rejects.toThrow(
      enqueueError.message,
    );

    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { in: ['recording'] },
            recordingRequestStatus: { eq: 'REQUESTED' },
            status: { eq: 'SCHEDULED' },
          },
          data: { recordingRequestStatus: 'CANCELED' },
        },
        id: true,
      },
    });
    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it.each([
    { externalBotId: 'bot' },
    { botScheduleAttemptedAt: '2026-10-07T00:00:00.000Z' },
  ])('re-arms previously canceled requests on retry: %j', async (booking) => {
    const enqueueError = new Error('queue unavailable');
    enqueueJobsMock.mockRejectedValue(enqueueError);
    await expect(syncCalendarBotSchedulingHandler()).rejects.toThrow(
      enqueueError.message,
    );

    queryMock.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: 'recording',
              status: 'SCHEDULED',
              recordingRequestStatus: 'CANCELED',
              ...booking,
            },
          },
        ],
        pageInfo: { hasNextPage: false },
      },
    });
    mutationMock.mockClear();
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
    await expect(syncCalendarBotSchedulingHandler()).resolves.toEqual({
      outcome: 'scheduled-bots-canceled',
      canceledCallRecordingCount: 0,
    });
    expect(mutationMock).not.toHaveBeenCalled();
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({
              or: expect.arrayContaining([
                expect.objectContaining({
                  recordingRequestStatus: { eq: 'CANCELED' },
                  or: [
                    { externalBotId: { is: 'NOT_NULL' } },
                    { botScheduleAttemptedAt: { is: 'NOT_NULL' } },
                  ],
                }),
              ]),
            }),
          }),
        }),
      }),
    );
    expect(enqueueJobsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: [
          expect.objectContaining({
            payload: { callRecordingId: 'recording', attempt: 0 },
          }),
        ],
      }),
    );
  });

  it('still arms recovery when the cancellation cleanup enqueue fails', async () => {
    const enqueueError = new Error('cleanup unavailable');
    enqueueJobsMock
      .mockRejectedValueOnce(enqueueError)
      .mockResolvedValue({ enqueued: true });

    await expect(syncCalendarBotSchedulingHandler()).rejects.toThrow(
      enqueueError.message,
    );
    expect(enqueueJobsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });
});
