import { isUndefined } from '@sniptt/guards';
import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type CalendarEventForDatabaseEvent } from 'src/logic-functions/types/calendar-event-for-database-event.type';
import { type RemovedCallRecorderOccurrence } from 'src/logic-functions/types/removed-call-recorder-occurrence.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { resolveConferenceLinkUrl } from 'src/logic-functions/domain/resolve-conference-link-url.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

const CALL_RECORDER_KEY_CALENDAR_EVENT_FIELDS = [
  'conferenceLink',
  'location',
  'description',
  'startsAt',
  'iCalUid',
];

type CalendarEventReconciliationPayload = {
  calendarEventIds: string[];
  echoCandidateCalendarEventIds: string[];
  removedOccurrences: RemovedCallRecorderOccurrence[];
};

export const buildCalendarEventReconciliationPayload = ({
  action,
  events,
}: {
  action: string | undefined;
  events: ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>[];
}): CalendarEventReconciliationPayload => {
  const eventReconciliationPayloads = events.map((event) =>
    buildEventReconciliationPayload({ action, event }),
  );

  return {
    calendarEventIds: getUniqueSortedIds(
      eventReconciliationPayloads.flatMap(
        (eventReconciliationPayload) =>
          eventReconciliationPayload.calendarEventIds,
      ),
    ),
    echoCandidateCalendarEventIds: getUniqueSortedIds(
      eventReconciliationPayloads.flatMap(
        (eventReconciliationPayload) =>
          eventReconciliationPayload.echoCandidateCalendarEventIds,
      ),
    ),
    removedOccurrences: eventReconciliationPayloads.flatMap(
      (eventReconciliationPayload) =>
        eventReconciliationPayload.removedOccurrences,
    ),
  };
};

const buildEventReconciliationPayload = ({
  action,
  event,
}: {
  action: string | undefined;
  event: ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>;
}): CalendarEventReconciliationPayload => {
  const changedCalendarEventIds = getUniqueSortedIds([
    event.recordId,
    event.properties.after?.id,
  ]);

  if (action === 'created') {
    return {
      calendarEventIds: changedCalendarEventIds,
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [],
    };
  }

  if (action === 'updated' && isPreferenceChangeBetweenBlankAndOn(event)) {
    return {
      calendarEventIds: [],
      echoCandidateCalendarEventIds: changedCalendarEventIds,
      removedOccurrences: [],
    };
  }

  if (action === 'updated') {
    return {
      calendarEventIds: changedCalendarEventIds,
      echoCandidateCalendarEventIds: [],
      removedOccurrences: hasKeyFieldChange(
        event.properties.updatedFields ?? [],
      )
        ? buildRemovedOccurrences(event.properties.before)
        : [],
    };
  }

  if (action === 'deleted' || action === 'destroyed') {
    return {
      calendarEventIds: [],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: buildRemovedOccurrences(event.properties.before),
    };
  }

  return {
    calendarEventIds: [],
    echoCandidateCalendarEventIds: [],
    removedOccurrences: [],
  };
};

const isPreferenceChangeBetweenBlankAndOn = (
  event: ObjectRecordBaseEvent<CalendarEventForDatabaseEvent>,
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

const hasKeyFieldChange = (updatedFields: string[]): boolean =>
  updatedFields.some((updatedField) =>
    CALL_RECORDER_KEY_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const buildRemovedOccurrences = (
  calendarEvent: CalendarEventForDatabaseEvent | undefined,
): RemovedCallRecorderOccurrence[] => {
  if (isUndefined(calendarEvent)) {
    return [];
  }

  return [
    {
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
    },
  ];
};
