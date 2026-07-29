import { defineLogicFunction, type ObjectRecordCreateEvent } from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALENDAR_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updatePersonLastContactFromCalendar } from 'src/utils/update-person-last-contact-from-calendar';

type CalendarEventParticipantCreate = {
  personId?: string | null;
};

// Same gap as on-email-participant-created: participants inserted with a
// person already attached never emit the personId update on-calendar-
// interaction listens for.
const handler = async (
  event: DatabaseEventPayload<
    ObjectRecordCreateEvent<CalendarEventParticipantCreate>
  >,
): Promise<void> => {
  const personId = event.properties.after.personId;

  if (!personId) {
    return;
  }

  await updatePersonLastContactFromCalendar(new CoreApiClient(), personId);
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-participant-created',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a calendar event participant is created already linked to a person (past events only).",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'calendarEventParticipant.created',
  },
  handler,
});
