import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

export const linkedinSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const externalId = await sendUnipileChatMessage({
    accountId: unipileAccountId,
    chatId: threadExternalId,
    text,
  });

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-send-message',
  description:
    'Sends a reply written in Twenty to its LinkedIn conversation through Unipile.',
  timeoutSeconds: 20,
  handler: linkedinSendMessageHandler,
});
