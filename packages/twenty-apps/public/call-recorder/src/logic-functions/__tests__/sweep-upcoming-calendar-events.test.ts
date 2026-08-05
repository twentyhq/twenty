import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-calendar-events-batch-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { RECONCILIATION_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/reconciliation-batch-stagger-milliseconds';
import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import sweepLogicFunction, {
  sweepUpcomingCalendarEventsHandler,
} from 'src/logic-functions/sweep-upcoming-calendar-events';

const queryMock = vi.hoisted(() => vi.fn());
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

const buildConnection = (calendarEventIds: string[]) => ({
  calendarEvents: {
    pageInfo: { hasNextPage: false, endCursor: null },
    edges: calendarEventIds.map((id) => ({ node: { id } })),
  },
});

// Zero-padded so the util's lexicographic id sort preserves this order.
const buildCalendarEventIds = (count: number): string[] =>
  Array.from(
    { length: count },
    (_, index) => `calendar-event-${String(index + 1).padStart(2, '0')}`,
  );

describe('sweepUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(buildConnection([]));
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('is configured as a daily cron dispatcher', () => {
    expect(sweepLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sweep-upcoming-calendar-events',
        timeoutSeconds: 250,
        cronTriggerSettings: { pattern: '0 4 * * *' },
      }),
    );
  });

  it('enqueues one staggered reconciliation job per batch of upcoming events', async () => {
    const calendarEventIds = buildCalendarEventIds(
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE + 1,
    );

    queryMock.mockResolvedValue(buildConnection(calendarEventIds));

    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual({
      outcome: 'batches-enqueued',
      calendarEventCount: calendarEventIds.length,
      enqueuedBatchCount: 2,
    });
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        calendarEventIds: calendarEventIds.slice(
          0,
          UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
        ),
      },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        calendarEventIds: calendarEventIds.slice(
          UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
        ),
      },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: RECONCILIATION_BATCH_STAGGER_MILLISECONDS,
    });
  });

  it('queries only non-canceled events inside the scheduling horizon', async () => {
    queryMock.mockResolvedValue(buildConnection(['calendar-event-1']));

    await sweepUpcomingCalendarEventsHandler();

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({ isCanceled: { eq: false } }),
          }),
        }),
      }),
    );
  });

  it('short-circuits without enqueueing when nothing is upcoming', async () => {
    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });
});
