import { isNonEmptyArray } from '@sniptt/guards';
import {
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/batch-handler-timeout-seconds';
import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { type UpcomingCalendarEventsReconciliationResult } from 'src/logic-functions/types/upcoming-calendar-events-reconciliation-result.type';
import { getCalendarEventIdsFromDatabaseEvents } from 'src/logic-functions/domain/get-calendar-event-ids-from-database-events.util';
import { fetchMemberRecordingPreferenceByUserWorkspaceId } from 'src/logic-functions/data/fetch-member-recording-preference-by-user-workspace-id.util';
import { reconcileCallRecorderForUpcomingCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder-for-upcoming-calendar-event-ids.util';
import { createCoreApiClientRunningAsApplication } from 'src/logic-functions/utils/create-core-api-client-running-as-application.util';

export const reconcileCallRecorderCalendarEventParticipantHandler = async (
  batch: Pick<
    DatabaseEventBatchPayload<
      ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>
    >,
    'events'
  >,
): Promise<UpcomingCalendarEventsReconciliationResult> => {
  const calendarEventIds = getCalendarEventIdsFromDatabaseEvents(batch.events);

  if (!isNonEmptyArray(calendarEventIds)) {
    return { skipped: true, reason: 'no calendar event' };
  }

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

  return reconcileCallRecorderForUpcomingCalendarEventIds({
    client: createCoreApiClientRunningAsApplication(),
    calendarEventIds,
  });
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
