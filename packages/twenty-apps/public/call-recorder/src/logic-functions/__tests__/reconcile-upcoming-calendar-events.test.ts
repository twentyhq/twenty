import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import routeLogicFunction, {
  reconcileUpcomingCalendarEventsHandler,
} from 'src/logic-functions/reconcile-upcoming-calendar-events';

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

const buildRoutePayload = (
  body: object | null,
): RoutePayload<{ calendarEventIds?: string[] }> =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    rawBody: undefined,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  }) as never;

const BATCH_RESULT = {
  reconciledCalendarEventIds: ['calendar-event-1'],
  failedCalendarEventIds: [],
  remainingCalendarEventIds: [],
  actionCounts: { created: 1, updated: 0, canceled: 0, skipped: 0, failed: 0 },
  continuationRequested: false,
};

describe('reconcileUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchUpcomingCalendarEventIdsMock.mockResolvedValue([]);
    reconcileUpcomingCalendarEventBatchesMock.mockResolvedValue(BATCH_RESULT);
  });

  it('is configured as an authenticated route with a self-invokable timeout', () => {
    expect(routeLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-upcoming-calendar-events',
        timeoutSeconds: 900,
        httpRouteTriggerSettings: {
          path: '/call-recorder/reconcile-upcoming-calendar-events',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }),
    );
  });

  it('processes explicit calendar event ids without sweeping', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
    expect(reconcileUpcomingCalendarEventBatchesMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
    expect(fetchUpcomingCalendarEventIdsMock).not.toHaveBeenCalled();
  });

  it('sweeps upcoming calendar events when no ids are given', async () => {
    fetchUpcomingCalendarEventIdsMock.mockResolvedValue([
      'calendar-event-1',
      'calendar-event-2',
    ]);

    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload(null),
    );

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

  it('short-circuits an empty sweep without running batches', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(reconcileUpcomingCalendarEventBatchesMock).not.toHaveBeenCalled();
  });

  it('does not sweep when an empty calendar event selection is sent', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: [] }),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(fetchUpcomingCalendarEventIdsMock).not.toHaveBeenCalled();
    expect(reconcileUpcomingCalendarEventBatchesMock).not.toHaveBeenCalled();
  });

  it('passes a deadline that reserves time for the continuation request', async () => {
    await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    const { deadlineAtMs } =
      reconcileUpcomingCalendarEventBatchesMock.mock.calls[0][0];

    expect(deadlineAtMs).toBeLessThan(Date.now() + 900 * 1000);
    expect(deadlineAtMs).toBeGreaterThan(Date.now() + 800 * 1000);
  });
});
