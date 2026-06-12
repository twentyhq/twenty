import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-channel-event-association-reconciliation-logic-function-universal-identifier';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileMeetingBotForCalendarEventIds } from 'src/logic-functions/flows/reconcile-meeting-bot.util';

const CALENDAR_CHANNEL_EVENT_ASSOCIATION_OBJECT_NAME =
  'calendarChannelEventAssociation';

const MEETING_BOT_RELEVANT_ASSOCIATION_FIELDS = [
  'calendarChannel',
  'calendarChannelId',
  'calendarEvent',
  'calendarEventId',
];

type CalendarChannelEventAssociationForDatabaseEvent = {
  id: string;
  calendarEventId?: string | null;
};

type CalendarChannelEventAssociationDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CalendarChannelEventAssociationForDatabaseEvent>
>;

export const reconcileMeetingBotCalendarChannelEventAssociationHandler = async (
  event: CalendarChannelEventAssociationDatabaseEvent,
): Promise<object | undefined> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALENDAR_CHANNEL_EVENT_ASSOCIATION_OBJECT_NAME) {
    return {
      skipped: true,
      reason: 'not a calendar channel event association',
    };
  }

  const calendarEventIds = buildCalendarEventIdsForAssociationChange({
    event,
    action,
  });

  if (calendarEventIds.length === 0) {
    return { skipped: true, reason: 'no relevant association change' };
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

const buildCalendarEventIdsForAssociationChange = ({
  event,
  action,
}: {
  event: CalendarChannelEventAssociationDatabaseEvent;
  action: string | undefined;
}): string[] => {
  if (action === 'created') {
    return getUniqueSortedIds([event.properties.after?.calendarEventId]);
  }

  if (action === 'updated') {
    const updatedFields = event.properties.updatedFields ?? [];

    if (!hasRelevantAssociationFieldChange(updatedFields)) {
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

const hasRelevantAssociationFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    MEETING_BOT_RELEVANT_ASSOCIATION_FIELDS.includes(updatedField),
  );

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_CHANNEL_EVENT_ASSOCIATION_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-meeting-bot-calendar-channel-event-association',
  description:
    'Reconciles app-managed Recall bot recording requests when calendar channel event associations change.',
  timeoutSeconds: 60,
  handler: reconcileMeetingBotCalendarChannelEventAssociationHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_CHANNEL_EVENT_ASSOCIATION_OBJECT_NAME}.*`,
  },
});
