import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type SendAppMessageAttachment,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/whatsapp-attachment-deadline-margin-milliseconds.constant';
import { WHATSAPP_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/whatsapp-attachment-max-size-bytes.constant';
import { WHATSAPP_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES } from 'src/constants/whatsapp-send-message-attachments-max-total-size-bytes.constant';
import { WHATSAPP_SEND_MESSAGE_TIMEOUT_SECONDS } from 'src/constants/whatsapp-send-message-timeout-seconds.constant';
import { WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { downloadSendMessageAttachmentOrThrow } from 'src/logic-functions/utils/download-send-message-attachment.util';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

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
    WHATSAPP_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES
  ) {
    throw new Error(
      `Attachments of a reply are larger than ${WHATSAPP_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES} bytes in total`,
    );
  }

  const unipileAttachments: UnipileOutgoingAttachment[] = [];
  let remainingSizeBytes =
    WHATSAPP_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES;

  for (const attachment of attachments) {
    const unipileAttachment = await downloadSendMessageAttachmentOrThrow({
      attachment,
      maxSizeBytes: Math.min(
        WHATSAPP_ATTACHMENT_MAX_SIZE_BYTES,
        remainingSizeBytes,
      ),
      deadlineAtMs,
    });

    remainingSizeBytes -= unipileAttachment.content.byteLength;
    unipileAttachments.push(unipileAttachment);
  }

  return unipileAttachments;
};

export const whatsappSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
  attachments,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const deadlineAtMs =
    Date.now() +
    WHATSAPP_SEND_MESSAGE_TIMEOUT_SECONDS * 1000 -
    WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;

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
  universalIdentifier: WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its WhatsApp conversation through Unipile.',
  timeoutSeconds: WHATSAPP_SEND_MESSAGE_TIMEOUT_SECONDS,
  handler: whatsappSendMessageHandler,
});
