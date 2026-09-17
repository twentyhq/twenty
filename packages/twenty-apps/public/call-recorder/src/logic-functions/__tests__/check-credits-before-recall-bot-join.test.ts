import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import checkCreditsBeforeRecallBotJoinLogicFunction from 'src/logic-functions/check-credits-before-recall-bot-join';
import { handlePreJoinCreditCheckJob } from 'src/logic-functions/flows/handle-pre-join-credit-check-job.util';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const getCreditAvailabilityMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/billing', () => ({
  getCreditAvailability: getCreditAvailabilityMock,
}));

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:49:00.000Z');
const JOIN_AT = '2026-01-01T12:59:00.000Z';

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

describe('check-credits-before-recall-bot-join', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    queryMock.mockReset();
    mutationMock.mockReset();
    getCreditAvailabilityMock.mockReset();
    queryMock.mockImplementation(async (query) =>
      query.callRecordings !== undefined
        ? {
            callRecordings: buildConnection([
              {
                id: 'call-recording-1',
                status: 'SCHEDULED',
                recordingRequestStatus: 'REQUESTED',
                calendarEventId: 'calendar-event-1',
                externalBotId: 'recall-bot-1',
              },
            ]),
          }
        : {
            calendarEvents: buildConnection([
              { id: 'calendar-event-1', startsAt: '2026-01-01T13:00:00.000Z' },
            ]),
          },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('runs as an enqueued job with no trigger of its own', () => {
    expect(checkCreditsBeforeRecallBotJoinLogicFunction.config).toMatchObject({
      name: 'check-credits-before-recall-bot-join',
      handler: handlePreJoinCreditCheckJob,
    });
  });

  it('skips a job whose payload names no recording or join time', async () => {
    const result = await handlePreJoinCreditCheckJob({
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'invalid pre-join credit check job',
    });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('asks the queue to redeliver when Recall refuses the cancellation', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    fetchMock.mockImplementation(
      async () => new Response(null, { status: 403 }),
    );

    await expect(
      handlePreJoinCreditCheckJob({
        callRecordingId: 'call-recording-1',
        joinAt: JOIN_AT,
      }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
