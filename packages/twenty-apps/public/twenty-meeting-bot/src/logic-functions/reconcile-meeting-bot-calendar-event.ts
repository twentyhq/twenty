import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-reconciliation-logic-function-universal-identifier';
import { type RemovedMeetingBotOccurrence } from 'src/logic-functions/types/removed-meeting-bot-occurrence.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileMeetingBotForCalendarEventIds } from 'src/logic-functions/flows/reconcile-meeting-bot.util';

const CALENDAR_EVENT_OBJECT_NAME = 'calendarEvent';

const MEETING_BOT_RELEVANT_CALENDAR_EVENT_FIELDS = [
  'title',
  'meetingBotPreference',
  'conferenceLink',
  'startsAt',
  'endsAt',
  'isCanceled',
  'iCalUid',
];

const MEETING_BOT_KEY_CALENDAR_EVENT_FIELDS = [
  'conferenceLink',
  'startsAt',
  'iCalUid',
];

type CalendarEventForDatabaseEvent = {
  id: string;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  iCalUid?: string | null;
  startsAt?: string | null;
};

type CalendarEventDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>
>;

type CalendarEventReconciliationPayload = {
  calendarEventIds: string[];
  removedOccurrences: RemovedMeetingBotOccurrence[];
};

const handler = async (
  event: CalendarEventDatabaseEvent,
): Promise<object | undefined> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALENDAR_EVENT_OBJECT_NAME) {
    return { skipped: true, reason: 'not a calendar event' };
  }

  const reconciliationPayload = buildCalendarEventReconciliationPayload({
    event,
    action,
  });

  if (
    reconciliationPayload.calendarEventIds.length === 0 &&
    reconciliationPayload.removedOccurrences.length === 0
  ) {
    return { skipped: true, reason: 'no relevant calendar event change' };
  }

  const client = new CoreApiClient();
  const reconciliationResults = await reconcileMeetingBotForCalendarEventIds({
    client,
    calendarEventIds: reconciliationPayload.calendarEventIds,
    removedOccurrences: reconciliationPayload.removedOccurrences,
  });

  return {
    reconciled: true,
    calendarEventIds: reconciliationPayload.calendarEventIds,
    removedOccurrenceCount: reconciliationPayload.removedOccurrences.length,
    reconciliationResults,
  };
};

const buildCalendarEventReconciliationPayload = ({
  event,
  action,
}: {
  event: CalendarEventDatabaseEvent;
  action: string | undefined;
}): CalendarEventReconciliationPayload => {
  if (action === 'created') {
    return {
      calendarEventIds: getUniqueSortedIds([
        event.recordId,
        event.properties.after?.id,
      ]),
      removedOccurrences: [],
    };
  }

  if (action === 'updated') {
    const updatedFields = event.properties.updatedFields ?? [];

    if (!hasRelevantFieldChange(updatedFields)) {
      return { calendarEventIds: [], removedOccurrences: [] };
    }

    const removedOccurrence = hasKeyFieldChange(updatedFields)
      ? buildRemovedOccurrence(event.properties.before)
      : undefined;

    return {
      calendarEventIds: getUniqueSortedIds([
        event.recordId,
        event.properties.after?.id,
      ]),
      removedOccurrences: isUndefined(removedOccurrence)
        ? []
        : [removedOccurrence],
    };
  }

  if (action === 'deleted' || action === 'destroyed') {
    const removedOccurrence = buildRemovedOccurrence(event.properties.before);

    return {
      calendarEventIds: [],
      removedOccurrences: isUndefined(removedOccurrence)
        ? []
        : [removedOccurrence],
    };
  }

  return { calendarEventIds: [], removedOccurrences: [] };
};

const hasRelevantFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    MEETING_BOT_RELEVANT_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const hasKeyFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    MEETING_BOT_KEY_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const buildRemovedOccurrence = (
  calendarEvent: CalendarEventForDatabaseEvent | undefined,
): RemovedMeetingBotOccurrence | undefined => {
  if (isUndefined(calendarEvent)) {
    return undefined;
  }

  return {
    calendarEventId: calendarEvent.id,
    realMeetingKey: computeRealMeetingKey({
      calendarEventId: calendarEvent.id,
      conferenceLinkUrl: calendarEvent.conferenceLink?.primaryLinkUrl,
      iCalUid: calendarEvent.iCalUid ?? undefined,
      startsAt: calendarEvent.startsAt ?? undefined,
    }),
    startsAt: calendarEvent.startsAt ?? undefined,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-meeting-bot-calendar-event',
  description:
    'Reconciles app-managed Recall bot recording requests when calendar events change.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_EVENT_OBJECT_NAME}.*`,
  },
});
