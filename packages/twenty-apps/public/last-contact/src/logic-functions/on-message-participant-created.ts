import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { MESSAGE_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  applyMessageParticipantEvents,
  type MessageParticipantEventRecord,
} from 'src/utils/apply-message-interactions';

// App channels (LinkedIn, WhatsApp...) can create participants already linked
// to a person, which never fires the personId update on-email-interaction listens to.
const handler = async (
  batch: DatabaseEventBatchPayload<
    ObjectRecordCreateEvent<MessageParticipantEventRecord>
  >,
): Promise<void> => {
  console.log('on-message-participant-created started', {
    eventCount: batch.events.length,
  });

  await applyMessageParticipantEvents(new CoreApiClient(), batch.events);
};

export default defineLogicFunction({
  universalIdentifier:
    MESSAGE_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-message-participant-created',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when a message participant is created already linked to them.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.created',
    batchMode: true,
  },
  handler,
});
