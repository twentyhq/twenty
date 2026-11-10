import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS } from 'src/constants/linkedin-send-message-timeout-seconds.constant';
import { LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinSendMessagePayload } from 'src/logic-functions/types/linkedin-send-message-payload.type';
import { downloadLinkedinOutgoingAttachments } from 'src/logic-functions/utils/download-linkedin-outgoing-attachments.util';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

export const linkedinSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
  attachments = [],
}: LinkedinSendMessagePayload): Promise<SendAppMessageResult> => {
  const downloadDeadlineAtMs =
    Date.now() +
    LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS * 1000 -
    LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;
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
    attachments: await downloadLinkedinOutgoingAttachments({
      attachments,
      deadlineAtMs: downloadDeadlineAtMs,
    }),
  });

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-send-message',
  description:
    'Sends a reply written in Twenty to its LinkedIn conversation through Unipile.',
  timeoutSeconds: LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS,
  handler: linkedinSendMessageHandler,
});
