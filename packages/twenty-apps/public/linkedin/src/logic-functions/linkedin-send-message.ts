import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';
import { LINKEDIN_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES } from 'src/constants/linkedin-send-message-attachments-max-total-size-bytes.constant';
import { LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS } from 'src/constants/linkedin-send-message-timeout-seconds.constant';
import { LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { downloadSendMessageAttachmentOrThrow } from 'src/logic-functions/utils/download-send-message-attachment.util';
import { type SendAppMessageAttachment } from 'src/types/send-app-message-attachment.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

// servers before 2.57 send no attachments field
type SendAppMessagePayloadWithAttachments = SendAppMessagePayload & {
  attachments?: SendAppMessageAttachment[];
};

const downloadAttachmentsWithinTotalSizeLimitOrThrow = async ({
  attachments,
  deadlineAtMs,
}: {
  attachments: SendAppMessageAttachment[];
  deadlineAtMs: number;
}): Promise<UnipileOutgoingAttachment[]> => {
  const announcedTotalSizeBytes = attachments.reduce(
    (totalSizeBytes, { size }) => totalSizeBytes + size,
    0,
  );

  if (
    announcedTotalSizeBytes >
    LINKEDIN_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES
  ) {
    throw new Error(
      `Attachments of a reply are larger than ${LINKEDIN_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES} bytes in total`,
    );
  }

  const unipileAttachments: UnipileOutgoingAttachment[] = [];
  let remainingSizeBytes =
    LINKEDIN_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES;

  // one at a time, so a file larger than announced cannot push the reply past the total limit
  for (const attachment of attachments) {
    const unipileAttachment = await downloadSendMessageAttachmentOrThrow({
      attachment,
      maxSizeBytes: Math.min(
        LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES,
        remainingSizeBytes,
      ),
      deadlineAtMs,
    });

    remainingSizeBytes -= Buffer.byteLength(
      unipileAttachment.content,
      'base64',
    );
    unipileAttachments.push(unipileAttachment);
  }

  return unipileAttachments;
};

export const linkedinSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
  attachments = [],
}: SendAppMessagePayloadWithAttachments): Promise<SendAppMessageResult> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const deadlineAtMs =
    Date.now() +
    LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS * 1000 -
    LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;

  const unipileAttachments =
    await downloadAttachmentsWithinTotalSizeLimitOrThrow({
      attachments,
      deadlineAtMs,
    });

  const externalId = await sendUnipileChatMessage({
    accountId: unipileAccountId,
    chatId: threadExternalId,
    text,
    attachments: unipileAttachments,
  });

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its LinkedIn conversation through Unipile.',
  timeoutSeconds: LINKEDIN_SEND_MESSAGE_TIMEOUT_SECONDS,
  handler: linkedinSendMessageHandler,
});
