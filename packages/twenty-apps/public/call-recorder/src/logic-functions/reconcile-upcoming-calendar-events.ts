import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-upcoming-calendar-events-logic-function-universal-identifier';
import { createRetryingCoreApiClient } from 'src/logic-functions/data/create-retrying-core-api-client.util';
import { countReconciliationActions } from 'src/logic-functions/domain/count-reconciliation-actions.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { type CallRecorderReconciliationActionCounts } from 'src/logic-functions/types/call-recorder-reconciliation-action-counts.type';
import { toIdList } from 'src/logic-functions/utils/to-id-list.util';

type ReconcileUpcomingCalendarEventsResult =
  | { outcome: 'nothing-selected' }
  | {
      outcome: 'processed';
      reconciledCalendarEventIds: string[];
      actionCounts: CallRecorderReconciliationActionCounts;
    };

export const reconcileUpcomingCalendarEventsHandler = async (
  payload: unknown,
): Promise<ReconcileUpcomingCalendarEventsResult> => {
  const calendarEventIds = toIdList(
    (payload as { calendarEventIds?: unknown } | null | undefined)
      ?.calendarEventIds,
  );

  if (calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  try {
    const reconciliationResults =
      await reconcileCallRecorderForCalendarEventIds({
        client: createRetryingCoreApiClient(),
        calendarEventIds,
      });

    return {
      outcome: 'processed',
      reconciledCalendarEventIds: calendarEventIds,
      actionCounts: countReconciliationActions(reconciliationResults),
    };
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `[call-recorder] upcoming calendar event batch reconciliation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-upcoming-calendar-events',
  description:
    'Reconciles one enqueued batch of upcoming calendar events so their recording bots match the recording policy.',
  timeoutSeconds: 900,
  handler: reconcileUpcomingCalendarEventsHandler,
});
