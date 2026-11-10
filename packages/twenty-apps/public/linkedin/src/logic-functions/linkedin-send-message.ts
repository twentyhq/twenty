import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinOutgoingAttachment } from 'src/logic-functions/types/linkedin-outgoing-attachment.type';
import { downloadLinkedinOutgoingAttachments } from 'src/logic-functions/utils/download-linkedin-outgoing-attachments.util';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

// the pinned twenty-sdk does not type `attachments` yet, and older servers do not send it
type LinkedinSendMessagePayload = SendAppMessagePayload & {
  attachments?: LinkedinOutgoingAttachment[];
};

export const linkedinSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
  attachments = [],
}: LinkedinSendMessagePayload): Promise<SendAppMessageResult> => {
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
    attachments: await downloadLinkedinOutgoingAttachments(attachments),
  });

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its LinkedIn conversation through Unipile.',
  timeoutSeconds: 60,
  handler: linkedinSendMessageHandler,
});
