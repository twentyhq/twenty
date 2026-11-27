import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  applyMessageParticipantEvents,
  type MessageParticipantEventRecord,
} from 'src/utils/apply-message-interactions';

const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordUpdateEvent<MessageParticipantEventRecord>
  >,
): Promise<void> => {
  console.log('on-email-interaction started', { eventCount: batch.events.length });

  await applyMessageParticipantEvents(new CoreApiClient(), batch.events);
};

export default defineLogicFunction({
  universalIdentifier: EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-interaction',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a message participant (email, LinkedIn, WhatsApp...) is linked to them.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.updated',
    updatedFields: ['personId'],
    batchMode: true,
  },
  handler,
});
