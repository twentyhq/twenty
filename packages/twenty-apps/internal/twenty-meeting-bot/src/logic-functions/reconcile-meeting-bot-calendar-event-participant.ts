import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-participant-reconciliation-logic-function-universal-identifier';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileMeetingBotForCalendarEventIds } from 'src/logic-functions/flows/reconcile-meeting-bot.util';

const CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME = 'calendarEventParticipant';

const MEETING_BOT_RELEVANT_PARTICIPANT_FIELDS = [
  'workspaceMember',
  'workspaceMemberId',
  'calendarEvent',
  'calendarEventId',
];

type CalendarEventParticipantForDatabaseEvent = {
  id: string;
  calendarEventId?: string | null;
};

type CalendarEventParticipantDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>
>;

const handler = async (
  event: CalendarEventParticipantDatabaseEvent,
): Promise<object | undefined> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME) {
    return { skipped: true, reason: 'not a calendar event participant' };
  }

  const calendarEventIds = buildCalendarEventIdsForParticipantChange({
    event,
    action,
  });

  if (calendarEventIds.length === 0) {
    return { skipped: true, reason: 'no relevant participant change' };
  }

  const client = new CoreApiClient();
  const reconciliationResults = await reconcileMeetingBotForCalendarEventIds({
    client,
    calendarEventIds,
  });

  return {
    reconciled: true,
    calendarEventIds,
    reconciliationResults,
  };
};

const buildCalendarEventIdsForParticipantChange = ({
  event,
  action,
}: {
  event: CalendarEventParticipantDatabaseEvent;
  action: string | undefined;
}): string[] => {
  if (action === 'created') {
    return getUniqueSortedIds([event.properties.after?.calendarEventId]);
  }

  if (action === 'updated') {
    const updatedFields = event.properties.updatedFields ?? [];

    if (!hasRelevantParticipantFieldChange(updatedFields)) {
      return [];
    }

    return getUniqueSortedIds([
      event.properties.before?.calendarEventId,
      event.properties.after?.calendarEventId,
    ]);
  }

  if (action === 'deleted' || action === 'destroyed') {
    return getUniqueSortedIds([event.properties.before?.calendarEventId]);
  }

  return [];
};

const hasRelevantParticipantFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    MEETING_BOT_RELEVANT_PARTICIPANT_FIELDS.includes(updatedField),
  );

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_PARTICIPANT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-meeting-bot-calendar-event-participant',
  description:
    'Reconciles app-managed Recall bot recording requests when calendar event participants change.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME}.*`,
  },
});
