import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  applyMeetingInteractions,
  type CalendarEventParticipantLink,
} from 'src/utils/apply-meeting-interactions';
import { scheduleMeetingSlotJobs } from 'src/utils/schedule-meeting-slot-jobs';

type CalendarEventParticipantUpdate = {
  personId?: string | null;
  calendarEventId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordUpdateEvent<CalendarEventParticipantUpdate>
  >,
): Promise<void> => {
  const linkByKey = new Map<string, CalendarEventParticipantLink>();

  for (const event of batch.events) {
    const personId = event.properties.after.personId;
    const calendarEventId = event.properties.after.calendarEventId;

    if (personId && calendarEventId) {
      linkByKey.set(`${personId}:${calendarEventId}`, {
        personId,
        calendarEventId,
      });
    }
  }

  if (linkByKey.size === 0) {
    return;
  }

  const upcomingMeetingStartsAts = await applyMeetingInteractions(
    new CoreApiClient(),
    [...linkByKey.values()],
  );

  await scheduleMeetingSlotJobs(upcomingMeetingStartsAts);
};

export default defineLogicFunction({
  universalIdentifier: CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-interaction',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a new calendar event participant is created. Meetings that have not started yet are scheduled for when they do.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'calendarEventParticipant.updated',
    updatedFields: ['personId'],
    batchMode: true,
  },
  handler,
});
