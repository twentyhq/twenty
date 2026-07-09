import { beforeEach, describe, expect, it, vi } from 'vitest';

import sweepLogicFunction, {
  sweepUpcomingCalendarEventsHandler,
} from 'src/logic-functions/sweep-upcoming-calendar-events';

const fetchUpcomingCalendarEventIdsMock = vi.hoisted(() => vi.fn());
const reconcileUpcomingCalendarEventBatchesMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util',
  () => ({
    fetchUpcomingCalendarEventIds: fetchUpcomingCalendarEventIdsMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util',
  () => ({
    reconcileUpcomingCalendarEventBatches:
      reconcileUpcomingCalendarEventBatchesMock,
  }),
);

const BATCH_RESULT = {
  reconciledCalendarEventIds: ['calendar-event-1'],
  failedCalendarEventIds: [],
  remainingCalendarEventIds: [],
  actionCounts: { created: 1, updated: 0, canceled: 0, skipped: 0, failed: 0 },
  continuationRequested: false,
};

describe('sweepUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchUpcomingCalendarEventIdsMock.mockResolvedValue([]);
    reconcileUpcomingCalendarEventBatchesMock.mockResolvedValue(BATCH_RESULT);
  });

  it('is configured as a daily cron with a self-invokable timeout', () => {
    expect(sweepLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sweep-upcoming-calendar-events',
        timeoutSeconds: 900,
        cronTriggerSettings: { pattern: '0 4 * * *' },
      }),
    );
  });

  it('reconciles every upcoming calendar event within the horizon', async () => {
    fetchUpcomingCalendarEventIdsMock.mockResolvedValue([
      'calendar-event-1',
      'calendar-event-2',
    ]);

    const result = await sweepUpcomingCalendarEventsHandler();

    expect(fetchUpcomingCalendarEventIdsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Date),
    );
    expect(reconcileUpcomingCalendarEventBatchesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      }),
    );
    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
  });

  it('short-circuits without running batches when nothing is upcoming', async () => {
    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(reconcileUpcomingCalendarEventBatchesMock).not.toHaveBeenCalled();
  });

  it('passes a deadline that reserves time for the continuation request', async () => {
    fetchUpcomingCalendarEventIdsMock.mockResolvedValue(['calendar-event-1']);

    await sweepUpcomingCalendarEventsHandler();

    const { deadlineAtMs } =
      reconcileUpcomingCalendarEventBatchesMock.mock.calls[0][0];

    expect(deadlineAtMs).toBeLessThan(Date.now() + 900 * 1000);
    expect(deadlineAtMs).toBeGreaterThan(Date.now() + 800 * 1000);
  });
});
