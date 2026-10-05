import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { CALENDAR_EVENT_RESCHEDULED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyMeetingInteractions } from 'src/utils/apply-meeting-interactions';
import { collectPersonMeetingParticipants } from 'src/utils/collect-person-meeting-participants';
import { scheduleMeetings } from 'src/utils/schedule-meetings';

type CalendarEventUpdate = {
  startsAt?: string | null;
  isCanceled?: boolean | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<CalendarEventUpdate>>,
): Promise<void> => {
  const now = new Date();
  const upcomingMeetingStartsAts: string[] = [];
  const startedCalendarEventIds: string[] = [];

  for (const event of batch.events) {
    const { startsAt, isCanceled } = event.properties.after ?? {};

    if (!startsAt || isCanceled === true) {
      continue;
    }

    if (Date.parse(startsAt) > now.getTime()) {
      upcomingMeetingStartsAts.push(startsAt);
    } else if (event.recordId) {
      startedCalendarEventIds.push(event.recordId);
    }
  }

  if (startedCalendarEventIds.length > 0) {
    const client = new CoreApiClient();
    const participants = await collectPersonMeetingParticipants(client, {
      calendarEventIds: startedCalendarEventIds,
      to: now,
    });

    await applyMeetingInteractions(client, participants);
  }

  await scheduleMeetings(upcomingMeetingStartsAts, now.getTime());
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_RESCHEDULED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-event-rescheduled',
  description:
    "Schedules a meeting's new time slot when its start time changes, so last contact is updated once it starts, or applies it right away when it moved into the past.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'calendarEvent.updated',
    updatedFields: ['startsAt'],
    batchMode: true,
  },
  handler,
});
