import { defineLogicFunction, ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import type { DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

import { EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updatePersonLastContactAtIfNewer } from 'src/utils/update-person-last-contact-at';

const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.MessageParticipant>>): Promise<void> => {
  const personId = event.properties.after.personId;
  const messageId = event.properties.after.messageId;

  if (!personId || !messageId) {
    return;
  }

  const client = new CoreApiClient();

  const { message } = await client.query({
    message: {
      __args: { filter: { id: { eq: messageId } } },
      id: true,
      receivedAt: true,
    },
  });

  const lastContactAt = message?.receivedAt ?? null;

  if (!lastContactAt) {
    return;
  }

  await updatePersonLastContactAtIfNewer(client, personId, lastContactAt);
};

export default defineLogicFunction({
  universalIdentifier: EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-interaction',
  description:
    'Updates a person\'s last-contacted fields when a new email participant is created.',
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.updated',
    updatedFields: ['personId']
  },
  handler,
});
