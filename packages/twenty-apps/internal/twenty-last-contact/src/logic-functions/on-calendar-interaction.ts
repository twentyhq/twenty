import { defineLogicFunction, ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import type { DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

import { CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updatePersonLastContactAtFromCalendar } from 'src/utils/update-person-last-contact-at-from-calendar';

const handler = async (event: DatabaseEventPayload<
  ObjectRecordUpdateEvent<CoreSchema.CalendarEventParticipant>
>): Promise<void> => {
  const personId = event.properties.after.personId;

  if (!personId) {
    return;
  }

  const client = new CoreApiClient();

  await updatePersonLastContactAtFromCalendar(client, personId);
};

export default defineLogicFunction({
  universalIdentifier: CALENDAR_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-interaction',
  description:
    'Updates a person\'s last-contacted fields when a new calendar event participant is created (past events only).',
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'calendarEventParticipant.updated',
    updatedFields: ['personId'],
  },
  handler,
});
