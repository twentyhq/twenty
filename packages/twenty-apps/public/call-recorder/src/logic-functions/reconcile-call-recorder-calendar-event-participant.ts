import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/batch-handler-timeout-seconds';
import { fetchRecordMyMeetingsChoices } from 'src/logic-functions/data/fetch-record-my-meetings-choices.util';
import { collectCalendarEventIdsFromParticipantEvents } from 'src/logic-functions/domain/collect-calendar-event-ids-from-participant-events.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

const CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME = 'calendarEventParticipant';

type CalendarEventParticipantBatchReconciliationResult =
  | { skipped: true; reason: string }
  | {
      reconciled: true;
      calendarEventIds: string[];
      reconciliationResults: CallRecorderReconciliationResult[];
    };

export const reconcileCallRecorderCalendarEventParticipantHandler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>
  >,
): Promise<CalendarEventParticipantBatchReconciliationResult> => {
  const [objectName] = batch.name.split('.');

  if (objectName !== CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME) {
    return { skipped: true, reason: 'not a calendar event participant' };
  }

  const calendarEventIds = collectCalendarEventIdsFromParticipantEvents(
    batch.events,
  );

  if (calendarEventIds.length === 0) {
    return { skipped: true, reason: 'no attendee change' };
  }

  const reconciliationResults = await reconcileCallRecorderForCalendarEventIds({
    client: new CoreApiClient({ fetch: fetchWithRateLimitRetry }),
    calendarEventIds,
    recordMyMeetingsChoices: await fetchRecordMyMeetingsChoices(),
  });

  return { reconciled: true, calendarEventIds, reconciliationResults };
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recorder-calendar-event-participant',
  description:
    'Reconciles app-managed Recall bot recording requests when the workspace members attending a calendar event change.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler: reconcileCallRecorderCalendarEventParticipantHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME}.*`,
    updatedFields: ['workspaceMemberId', 'calendarEventId'],
    batchMode: true,
  },
});
