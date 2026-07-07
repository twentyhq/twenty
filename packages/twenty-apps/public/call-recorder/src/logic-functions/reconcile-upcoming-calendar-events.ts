import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-upcoming-calendar-events-logic-function-universal-identifier';
import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';
import { reconcileUpcomingCalendarEventBatches } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util';
import { type ReconcileUpcomingCalendarEventBatchesResult } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches-result.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

type ReconcileUpcomingCalendarEventsRouteBody = {
  calendarEventIds?: unknown;
};

type ReconcileUpcomingCalendarEventsRouteResult =
  | { outcome: 'nothing-selected' }
  | { outcome: 'nothing-to-reconcile' }
  | ({ outcome: 'processed' } & ReconcileUpcomingCalendarEventBatchesResult);

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

export const reconcileUpcomingCalendarEventsHandler = async (
  payload: RoutePayload<ReconcileUpcomingCalendarEventsRouteBody>,
): Promise<ReconcileUpcomingCalendarEventsRouteResult> => {
  const startedAtMs = Date.now();
  const client = new CoreApiClient();

  const requestedCalendarEventIds = payload.body?.calendarEventIds;
  const isSweep = isUndefined(requestedCalendarEventIds);

  const calendarEventIds = isSweep
    ? await fetchUpcomingCalendarEventIds(client, new Date(startedAtMs))
    : toIdList(requestedCalendarEventIds);

  if (calendarEventIds.length === 0) {
    return isSweep
      ? { outcome: 'nothing-to-reconcile' }
      : { outcome: 'nothing-selected' };
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
    'HTTP-triggered upcoming calendar event sweep, kicked off on a fresh install and used to continue itself near the timeout. Called with no ids to discover and sweep every event within the scheduling horizon, or with explicit calendar event ids to continue a sweep; re-invokes itself with the remaining ids when a batch approaches the timeout. The scheduled sweep keeps the window fresh thereafter.',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: reconcileUpcomingCalendarEventsHandler,
  httpRouteTriggerSettings: {
    path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
