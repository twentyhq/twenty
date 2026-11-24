import { isNonEmptyArray } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/batch-handler-timeout-seconds';
import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';
import { getCalendarEventIdsFromParticipantEvents } from 'src/logic-functions/domain/get-calendar-event-ids-from-participant-events.util';
import { fetchMemberRecordingPreferenceByUserWorkspaceId } from 'src/logic-functions/data/fetch-member-recording-preference-by-user-workspace-id.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

type CalendarEventParticipantBatchReconciliationResult =
  | { skipped: true; reason: string }
  | {
      reconciled: true;
      calendarEventIds: string[];
      reconciliationResults: CallRecorderReconciliationResult[];
    };

export const reconcileCallRecorderCalendarEventParticipantHandler = async (
  batch: Pick<
    DatabaseEventBatchPayload<
      ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>
    >,
    'events'
  >,
): Promise<CalendarEventParticipantBatchReconciliationResult> => {
  const calendarEventIds = getCalendarEventIdsFromParticipantEvents(
    batch.events,
  );

  if (!isNonEmptyArray(calendarEventIds)) {
    return { skipped: true, reason: 'no calendar event' };
  }

  // A calendar import saves every participant of every meeting, so this runs
  // often; the guest list only matters to these two choices.
  const memberRecordingPreferences = [
    ...(await fetchMemberRecordingPreferenceByUserWorkspaceId()).values(),
  ];

  if (
    !memberRecordingPreferences.includes('INTERNAL') &&
    !memberRecordingPreferences.includes('EXTERNAL')
  ) {
    return {
      skipped: true,
      reason: 'no member records by internal or external meetings',
    };
  }

  const reconciliationResults = await reconcileCallRecorderForCalendarEventIds({
    client: new CoreApiClient({ fetch: fetchWithRateLimitRetry }),
    calendarEventIds,
  });

  return { reconciled: true, calendarEventIds, reconciliationResults };
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recorder-calendar-event-participant',
  description:
    'Reconciles app-managed Recall bot recording requests when the participants of a calendar event change.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler: reconcileCallRecorderCalendarEventParticipantHandler,
  databaseEventTriggerSettings: {
    eventName: 'calendarEventParticipant.*',
    updatedFields: ['handle', 'workspaceMemberId'],
    batchMode: true,
  },
});
