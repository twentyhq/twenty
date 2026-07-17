import { defineLogicFunction, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updatePersonLastContactFromCalendar } from 'src/utils/update-person-last-contact-from-calendar';

type CalendarEventParticipantUpdate = {
  personId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<
    ObjectRecordUpdateEvent<CalendarEventParticipantUpdate>
  >,
): Promise<void> => {
  const personId = event.properties.after.personId;

  if (!personId) {
    return;
  }

  const client = new CoreApiClient();

  await updatePersonLastContactFromCalendar(client, personId);
};

export default defineLogicFunction({
  universalIdentifier: CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-interaction',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a new calendar event participant is created (past events only).",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'calendarEventParticipant.updated',
    updatedFields: ['personId'],
  },
  handler,
});
