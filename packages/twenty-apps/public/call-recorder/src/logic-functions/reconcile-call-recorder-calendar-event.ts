import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type RemovedCallRecorderOccurrence } from 'src/logic-functions/types/removed-call-recorder-occurrence.type';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { resolveConferenceLinkUrl } from 'src/logic-functions/domain/resolve-conference-link-url.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

const CALENDAR_EVENT_OBJECT_NAME = 'calendarEvent';

const CALL_RECORDER_RELEVANT_CALENDAR_EVENT_FIELDS = [
  'title',
  'callRecorderPreference',
  'conferenceLink',
  'location',
  'description',
  'startsAt',
  'endsAt',
  'isCanceled',
  'iCalUid',
];

// location and description are key fields because the conference link is
// parsed out of them when the structured conferenceLink is empty.
const CALL_RECORDER_KEY_CALENDAR_EVENT_FIELDS = [
  'conferenceLink',
  'location',
  'description',
  'startsAt',
  'iCalUid',
];

type CalendarEventForDatabaseEvent = {
  id: string;
  callRecorderPreference?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  location?: string | null;
  description?: string | null;
  iCalUid?: string | null;
  startsAt?: string | null;
};

type CalendarEventDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>
>;

type CalendarEventReconciliationPayload = {
  calendarEventIds: string[];
  removedOccurrences: RemovedCallRecorderOccurrence[];
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

  // Skips only the echo of the app's own On write; an On the policy cannot honor reconciles and is cleared.
  if (
    isPreferenceChangeBetweenBlankAndOn(event) &&
    (await isCallRecorderBotDueForCalendarEvent(client, event.recordId))
  ) {
    return {
      skipped: true,
      reason: 'preference change on a meeting whose bot is already due',
    };
  }

  const reconciliationResults = await reconcileCallRecorderForCalendarEventIds({
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
    CALL_RECORDER_RELEVANT_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const isPreferenceChangeBetweenBlankAndOn = (
  event: CalendarEventDatabaseEvent,
): boolean => {
  const updatedFields = event.properties.updatedFields ?? [];

  return (
    updatedFields.length === 1 &&
    updatedFields[0] === 'callRecorderPreference' &&
    event.properties.before?.callRecorderPreference !==
      CallRecorderPreference.OFF &&
    event.properties.after?.callRecorderPreference !==
      CallRecorderPreference.OFF
  );
};

const isCallRecorderBotDueForCalendarEvent = async (
  client: CoreApiClient,
  calendarEventId: string,
): Promise<boolean> => {
  const calendarEvent = (
    await fetchCalendarEventsByIds(client, [calendarEventId])
  )[0];

  return (
    !isUndefined(calendarEvent) &&
    buildCallRecorderPolicyResult(calendarEvent, new Date()).shouldRequestBot
  );
};

const hasKeyFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    CALL_RECORDER_KEY_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const buildRemovedOccurrence = (
  calendarEvent: CalendarEventForDatabaseEvent | undefined,
): RemovedCallRecorderOccurrence | undefined => {
  if (isUndefined(calendarEvent)) {
    return undefined;
  }

  return {
    calendarEventId: calendarEvent.id,
    realMeetingKey: computeRealMeetingKey({
      calendarEventId: calendarEvent.id,
      conferenceLinkUrl: resolveConferenceLinkUrl({
        conferenceLinkUrl: calendarEvent.conferenceLink?.primaryLinkUrl,
        location: stripRestrictedFieldValue(
          calendarEvent.location ?? undefined,
        ),
        description: stripRestrictedFieldValue(
          calendarEvent.description ?? undefined,
        ),
      }),
      iCalUid: calendarEvent.iCalUid ?? undefined,
      startsAt: calendarEvent.startsAt ?? undefined,
    }),
    startsAt: calendarEvent.startsAt ?? undefined,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recorder-calendar-event',
  description:
    'Reconciles app-managed Recall bot recording requests when calendar events change.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${CALENDAR_EVENT_OBJECT_NAME}.*`,
  },
});
