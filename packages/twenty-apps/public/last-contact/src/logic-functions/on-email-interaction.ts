import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  applyEmailInteractions,
  type MessageParticipantLink,
} from 'src/utils/apply-email-interactions';

type MessageParticipantUpdate = {
  personId?: string | null;
  messageId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordUpdateEvent<MessageParticipantUpdate>
  >,
): Promise<void> => {
  const linkByKey = new Map<string, MessageParticipantLink>();

  for (const event of batch.events) {
    const personId = event.properties.after.personId;
    const messageId = event.properties.after.messageId;

    if (personId && messageId) {
      linkByKey.set(`${personId}:${messageId}`, { personId, messageId });
    }
  }

  if (linkByKey.size === 0) {
    return;
  }

  await applyEmailInteractions(new CoreApiClient(), [...linkByKey.values()]);
};

export default defineLogicFunction({
  universalIdentifier: EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-interaction',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a new email participant is created.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.updated',
    updatedFields: ['personId'],
    batchMode: true,
  },
  handler,
});
