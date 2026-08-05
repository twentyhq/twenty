import { isUndefined } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-upcoming-calendar-events-logic-function-universal-identifier';
import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import {
  enqueueReconcileCalendarEventsBatches,
  type EnqueueReconcileCalendarEventsBatchesResult,
} from 'src/logic-functions/data/enqueue-reconcile-calendar-events-batches.util';
import { enqueueUpcomingCalendarEventsSweep } from 'src/logic-functions/data/enqueue-upcoming-calendar-events-sweep.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ReconcileUpcomingCalendarEventsRouteBody = {
  calendarEventIds?: unknown;
};

type ReconcileUpcomingCalendarEventsRouteResult =
  | { outcome: 'nothing-selected' }
  | { outcome: 'sweep-enqueued' }
  | ({
      outcome: 'batches-enqueued';
    } & EnqueueReconcileCalendarEventsBatchesResult);

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

export const reconcileUpcomingCalendarEventsHandler = async (
  payload: RoutePayload<ReconcileUpcomingCalendarEventsRouteBody>,
): Promise<ReconcileUpcomingCalendarEventsRouteResult> => {
  const requestedCalendarEventIds = payload.body?.calendarEventIds;

  if (isUndefined(requestedCalendarEventIds)) {
    await enqueueUpcomingCalendarEventsSweep();

    return { outcome: 'sweep-enqueued' };
  }

  const calendarEventIds = toIdList(requestedCalendarEventIds);

  if (calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  const result = await enqueueReconcileCalendarEventsBatches({
    calendarEventIds,
  });

  return { outcome: 'batches-enqueued', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-upcoming-calendar-events',
  description:
    'Enqueues reconciliation jobs for the requested calendar events, or the discovery sweep when no ids are given.',
  timeoutSeconds: 60,
  handler: reconcileUpcomingCalendarEventsHandler,
  httpRouteTriggerSettings: {
    path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
