import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import sweepLogicFunction, {
  sweepUpcomingCalendarEventsHandler,
} from 'src/logic-functions/sweep-upcoming-calendar-events';

const queryMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

let upcomingCalendarEventIds: string[];

describe('sweepUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upcomingCalendarEventIds = [];
    queryMock.mockImplementation(async () => ({
      calendarEvents: buildConnection(
        upcomingCalendarEventIds.map((id) => ({ id })),
      ),
    }));
    enqueueJobsMock.mockImplementation(async ({ payloads }) => ({
      enqueued: true,
      enqueuedJobsCount: payloads.length,
    }));
  });

  it('is configured as a daily cron', () => {
    expect(sweepLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sweep-upcoming-calendar-events',
        timeoutSeconds: 900,
        cronTriggerSettings: { pattern: '0 4 * * *' },
      }),
    );
  });

  it('enqueues one reconciliation batch for the upcoming calendar events', async () => {
    upcomingCalendarEventIds = ['calendar-event-1', 'calendar-event-2'];

    const result = await sweepUpcomingCalendarEventsHandler();

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({ isCanceled: { eq: false } }),
          }),
        }),
      }),
    );
    expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobsMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(enqueueJobsMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        { calendarEventIds: ['calendar-event-1', 'calendar-event-2'] },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(result).toEqual({
      outcome: 'batches-enqueued',
      calendarEventCount: 2,
      batchCount: 1,
    });
  });

  it('splits the window into batches of the reconciliation batch size', async () => {
    upcomingCalendarEventIds = Array.from(
      { length: UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE + 1 },
      (_, calendarEventIndex) => `calendar-event-${calendarEventIndex}`,
    );

    const result = await sweepUpcomingCalendarEventsHandler();

    const [{ payloads }] = enqueueJobsMock.mock.calls[1];

    expect(payloads).toHaveLength(2);
    expect(payloads[0].calendarEventIds).toHaveLength(
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
    );
    expect(payloads[1].calendarEventIds).toHaveLength(1);
    expect(result).toEqual(
      expect.objectContaining({ outcome: 'batches-enqueued', batchCount: 2 }),
    );
  });

  it('still enqueues the preference cleanup when nothing is upcoming', async () => {
    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('marks sweep failures as retryable so the platform redelivers the job', async () => {
    queryMock.mockRejectedValue(new Error('Service unavailable'));

    await expect(sweepUpcomingCalendarEventsHandler()).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
