import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-calendar-events-batch-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { RECONCILIATION_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/reconciliation-batch-stagger-milliseconds';
import { enqueueReconcileCalendarEventsBatches } from 'src/logic-functions/data/enqueue-reconcile-calendar-events-batches.util';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

vi.mock(
  'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size',
  () => ({
    UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE: 2,
  }),
);

describe('enqueueReconcileCalendarEventsBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('enqueues one staggered job per batch and reports counts', async () => {
    const result = await enqueueReconcileCalendarEventsBatches({
      calendarEventIds: [
        'calendar-event-1',
        'calendar-event-2',
        'calendar-event-3',
      ],
    });

    expect(result).toEqual({ calendarEventCount: 3, enqueuedBatchCount: 2 });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { calendarEventIds: ['calendar-event-1', 'calendar-event-2'] },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { calendarEventIds: ['calendar-event-3'] },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: RECONCILIATION_BATCH_STAGGER_MILLISECONDS,
    });
  });

  it('throws partial progress without enqueueing later batches', async () => {
    const enqueueError = new Error('Network failed');

    enqueueJobMock
      .mockResolvedValueOnce({
        enqueued: true,
        logicFunctionUniversalIdentifier:
          RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      })
      .mockRejectedValueOnce(enqueueError);

    await expect(
      enqueueReconcileCalendarEventsBatches({
        calendarEventIds: [
          'calendar-event-1',
          'calendar-event-2',
          'calendar-event-3',
          'calendar-event-4',
          'calendar-event-5',
          'calendar-event-6',
        ],
      }),
    ).rejects.toMatchObject({
      message:
        'calendar event reconciliation enqueued 1 of 3 batches before enqueue failed: Network failed',
      cause: enqueueError,
    });
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
  });
});
