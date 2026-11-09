import { isNonEmptyString } from '@sniptt/guards';
import {
  type IngestMessageAttachment,
  uploadMessageAttachment,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';
import { LINKEDIN_IMPORTED_ATTACHMENT_TYPES } from 'src/constants/linkedin-imported-attachment-types.constant';
import { type LinkedinMessageAttachments } from 'src/logic-functions/types/linkedin-message-attachments.type';
import { buildLinkedinAttachmentFilename } from 'src/logic-functions/utils/build-linkedin-attachment-filename.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';
import { downloadUnipileMessageAttachment } from 'src/unipile/utils/download-unipile-message-attachment.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const isImportableAttachment = (
  attachment: UnipileMessageAttachment,
): boolean =>
  LINKEDIN_IMPORTED_ATTACHMENT_TYPES.includes(attachment.type) &&
  !attachment.is_unavailable &&
  (!isDefined(attachment.file_size) ||
    attachment.file_size <= LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES);

const importAttachment = async ({
  unipileAccountId,
  message,
  attachment,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  message: UnipileMessage;
  attachment: UnipileMessageAttachment;
  deadlineAtMs: number;
}): Promise<IngestMessageAttachment | undefined> => {
  const content = isNonEmptyString(attachment.content)
    ? Buffer.from(attachment.content, 'base64')
    : await downloadUnipileMessageAttachment({
        accountId: unipileAccountId,
        chatId: message.chat_id,
        messageId: message.id,
        attachmentId: attachment.id,
        maxSizeBytes: LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES,
        deadlineAtMs,
      });

  if (content.byteLength > LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES) {
    console.warn(
      `[linkedin] attachment ${attachment.id} of message ${message.id} not imported: larger than ${LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES} bytes`,
    );

    return undefined;
  }

  return uploadMessageAttachment({
    filename: buildLinkedinAttachmentFilename(attachment),
    content: new Uint8Array(content),
    signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
  });
};

export const importLinkedinMessageAttachments = async ({
  unipileAccountId,
  messages,
  deadlineAtMs,
  onMessageAttachments,
}: {
  unipileAccountId: string;
  messages: UnipileMessage[];
  deadlineAtMs: number;
  onMessageAttachments: (
    messageAttachments: LinkedinMessageAttachments,
  ) => Promise<void>;
}): Promise<number> => {
  let importedCount = 0;

  for (const message of messages) {
    const attachments: IngestMessageAttachment[] = [];

    for (const attachment of (message.attachments ?? []).filter(
      isImportableAttachment,
    )) {
      // A message only gets attachments once, so a partial set would never be completed
      if (Date.now() >= deadlineAtMs) {
        console.warn(
          `[linkedin] chat ${message.chat_id}: attachment import reached the job deadline, remaining files skipped`,
        );

        return importedCount;
      }

      try {
        const importedAttachment = await importAttachment({
          unipileAccountId,
          message,
          attachment,
          deadlineAtMs,
        });

        if (isDefined(importedAttachment)) {
          attachments.push(importedAttachment);
        }
      } catch (error) {
        if (error instanceof UnipileRateLimitError) {
          throw error;
        }

        console.warn(
          `[linkedin] attachment ${attachment.id} of message ${message.id} not imported: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (attachments.length > 0) {
      await onMessageAttachments({
        messageExternalId: message.id,
        attachments,
      });
      importedCount += attachments.length;
    }
  }

  return importedCount;
};
