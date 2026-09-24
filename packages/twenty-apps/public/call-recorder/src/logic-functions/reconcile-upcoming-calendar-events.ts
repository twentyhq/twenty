import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { countReconciliationActions } from 'src/logic-functions/domain/count-reconciliation-actions.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { type CallRecorderReconciliationActionCounts } from 'src/logic-functions/types/call-recorder-reconciliation-action-counts.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
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
  const calendarEventIds = toIdList(asRecord(payload)?.calendarEventIds);

  if (calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  try {
    const reconciliationResults =
      await reconcileCallRecorderForCalendarEventIds({
        client: new CoreApiClient(),
        calendarEventIds,
      });

    return {
      outcome: 'processed',
      reconciledCalendarEventIds: calendarEventIds,
      actionCounts: countReconciliationActions(reconciliationResults),
    };
  } catch (error) {
    throw buildRetryableStepFailure(
      'upcoming calendar event batch reconciliation',
      error,
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
