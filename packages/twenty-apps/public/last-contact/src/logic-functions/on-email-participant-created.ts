import { defineLogicFunction, type ObjectRecordCreateEvent } from 'twenty-sdk/define';
import type { DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { EMAIL_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyEmailInteraction } from 'src/utils/apply-email-interaction';

type MessageParticipantCreate = {
  personId?: string | null;
  messageId?: string | null;
};

// Participants are usually inserted unmatched and linked to a person a moment
// later, which on-email-interaction picks up. Rows that are already linked on
// insert never emit that update, so they would otherwise be missed entirely.
const handler = async (
  event: DatabaseEventPayload<ObjectRecordCreateEvent<MessageParticipantCreate>>,
): Promise<void> => {
  const personId = event.properties.after.personId;
  const messageId = event.properties.after.messageId;

  if (!personId || !messageId) {
    return;
  }

  await applyEmailInteraction(new CoreApiClient(), { personId, messageId });
};

export default defineLogicFunction({
  universalIdentifier:
    EMAIL_PARTICIPANT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-participant-created',
  description:
    "Updates a person's last-contacted fields, and the last contact on their company and opportunities, when an email participant is created already linked to a person.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.created',
  },
  handler,
});
