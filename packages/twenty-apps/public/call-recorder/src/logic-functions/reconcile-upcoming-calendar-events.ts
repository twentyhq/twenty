import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-upcoming-calendar-events-logic-function-universal-identifier';
import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';
import { reconcileUpcomingCalendarEventBatches } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

type ReconcileUpcomingCalendarEventsRouteBody = {
  calendarEventIds?: string[];
};

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

export const reconcileUpcomingCalendarEventsHandler = async (
  payload: RoutePayload<ReconcileUpcomingCalendarEventsRouteBody>,
): Promise<object> => {
  const startedAtMs = Date.now();
  const client = new CoreApiClient();

  const hasRequestedIds =
    payload.body !== undefined &&
    payload.body !== null &&
    Object.prototype.hasOwnProperty.call(payload.body, 'calendarEventIds');

  let calendarEventIds = toIdList(payload.body?.calendarEventIds);

  if (hasRequestedIds && calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  if (!hasRequestedIds) {
    calendarEventIds = await fetchUpcomingCalendarEventIds(
      client,
      new Date(startedAtMs),
    );

    if (calendarEventIds.length === 0) {
      return { outcome: 'nothing-to-reconcile' };
    }
  }

  const result = await reconcileUpcomingCalendarEventBatches({
    client,
    calendarEventIds,
    deadlineAtMs:
      startedAtMs + TIMEOUT_SECONDS * 1000 - CONTINUATION_RESERVE_MS,
  });

  return { outcome: 'processed', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-upcoming-calendar-events',
  description:
    'Sweeps upcoming calendar events through call recorder reconciliation so meetings that predate the app installation get their recording bots. Called with no ids to discover and sweep every upcoming event, or with explicit calendar event ids to continue a sweep; re-invokes itself with the remaining ids when a batch approaches the timeout.',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: reconcileUpcomingCalendarEventsHandler,
  httpRouteTriggerSettings: {
    path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
