import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { CALENDAR_EVENT_RESCHEDULED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { scheduleMeetings } from 'src/utils/schedule-meetings';

type CalendarEventUpdate = {
  startsAt?: string | null;
  isCanceled?: boolean | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<CalendarEventUpdate>>,
): Promise<void> => {
  const meetingStartsAts: string[] = [];

  for (const event of batch.events) {
    const { startsAt, isCanceled } = event.properties.after ?? {};

    if (startsAt && isCanceled !== true) {
      meetingStartsAts.push(startsAt);
    }
  }

  await scheduleMeetings(meetingStartsAts);
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_RESCHEDULED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-event-rescheduled',
  description:
    "Schedules a meeting's new time slot when its start time changes, so last contact is updated once it starts.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'calendarEvent.updated',
    updatedFields: ['startsAt'],
    batchMode: true,
  },
  handler,
});
