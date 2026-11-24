import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handlePreJoinCreditCheckJob } from 'src/logic-functions/flows/handle-pre-join-credit-check-job.util';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const getCreditAvailabilityMock = vi.hoisted(() => vi.fn());
const reconcileCallRecordingMeetingMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/billing', () => ({
  getCreditAvailability: getCreditAvailabilityMock,
}));

vi.mock(
  'src/logic-functions/flows/reconcile-call-recording-meeting.util',
  () => ({ reconcileCallRecordingMeeting: reconcileCallRecordingMeetingMock }),
);

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:49:00.000Z');

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

let recordingRequestStatus: string;

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
    reconcileCallRecordingMeetingMock.mockReset();
    recordingRequestStatus = 'REQUESTED';
    queryMock.mockImplementation(async (query) =>
      query.callRecordings !== undefined
        ? {
            callRecordings: buildConnection([
              {
                id: 'call-recording-1',
                status: 'SCHEDULED',
                recordingRequestStatus,
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

  it('leaves the bot alone when the meeting stopped being recorded since it was scheduled', async () => {
    reconcileCallRecordingMeetingMock.mockImplementation(async () => {
      recordingRequestStatus = 'CANCELED';
    });

    await expect(
      handlePreJoinCreditCheckJob({ callRecordingId: 'call-recording-1' }),
    ).resolves.toMatchObject({ status: 'skipped' });

    expect(reconcileCallRecordingMeetingMock).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingId: 'call-recording-1' }),
    );
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('asks the queue to redeliver when the meeting cannot be re-checked', async () => {
    reconcileCallRecordingMeetingMock.mockRejectedValue(
      new Error('metadata unavailable'),
    );

    await expect(
      handlePreJoinCreditCheckJob({ callRecordingId: 'call-recording-1' }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });

    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
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
      handlePreJoinCreditCheckJob({ callRecordingId: 'call-recording-1' }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
