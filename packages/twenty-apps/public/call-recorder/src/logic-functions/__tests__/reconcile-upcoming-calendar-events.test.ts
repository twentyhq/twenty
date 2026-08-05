import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-calendar-events-batch-logic-function-universal-identifier';
import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import routeLogicFunction, {
  reconcileUpcomingCalendarEventsHandler,
} from 'src/logic-functions/reconcile-upcoming-calendar-events';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

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

describe('reconcileUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockImplementation(
      async ({ logicFunctionUniversalIdentifier }) => ({
        enqueued: true,
        logicFunctionUniversalIdentifier,
      }),
    );
  });

  it('is configured as an authenticated dispatch route', () => {
    expect(routeLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-upcoming-calendar-events',
        timeoutSeconds: 60,
        httpRouteTriggerSettings: {
          path: '/call-recorder/reconcile-upcoming-calendar-events',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }),
    );
  });

  it('enqueues reconciliation jobs for explicit calendar event ids', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      }),
    );

    expect(result).toEqual({
      outcome: 'batches-enqueued',
      calendarEventCount: 2,
      enqueuedBatchCount: 1,
    });
    expect(enqueueJobMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
  });

  it('enqueues the discovery sweep when no ids are given', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload(null),
    );

    expect(result).toEqual({ outcome: 'sweep-enqueued' });
    expect(enqueueJobMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('enqueues the discovery sweep for an empty body object', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'sweep-enqueued' });
    expect(enqueueJobMock).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('does not enqueue anything when an empty calendar event selection is sent', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: [] }),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });
});
