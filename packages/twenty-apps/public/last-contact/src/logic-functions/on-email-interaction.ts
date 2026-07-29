import { defineLogicFunction, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import type { DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyEmailInteraction } from 'src/utils/apply-email-interaction';

type MessageParticipantUpdate = {
  personId?: string | null;
  messageId?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<MessageParticipantUpdate>>,
): Promise<void> => {
  const personId = event.properties.after.personId;
  const messageId = event.properties.after.messageId;

  if (!personId || !messageId) {
    return;
  }

  await applyEmailInteraction(new CoreApiClient(), { personId, messageId });
};

export default defineLogicFunction({
  universalIdentifier: EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-interaction',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when an email participant is matched to a person.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.updated',
    updatedFields: ['personId'],
  },
  handler,
});
