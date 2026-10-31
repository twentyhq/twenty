import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';
import { LINKEDIN_IMPORTED_ATTACHMENT_TYPES } from 'src/constants/linkedin-imported-attachment-types.constant';
import { type LinkedinMessageAttachmentFile } from 'src/logic-functions/types/linkedin-message-attachment-file.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';
import { downloadUnipileMessageAttachment } from 'src/unipile/utils/download-unipile-message-attachment.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const isImportableAttachment = (
  attachment: UnipileMessageAttachment,
): boolean =>
  LINKEDIN_IMPORTED_ATTACHMENT_TYPES.includes(attachment.type) &&
  attachment.is_unavailable !== true &&
  (!isDefined(attachment.file_size) ||
    attachment.file_size <= LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES);

// Rate limits propagate so a history import pauses and replays the page; other failures only drop the file
export const importLinkedinMessageAttachments = async ({
  unipileAccountId,
  messages,
}: {
  unipileAccountId: string;
  messages: UnipileMessage[];
}): Promise<LinkedinMessageAttachmentFile[]> => {
  const files: LinkedinMessageAttachmentFile[] = [];

  for (const message of messages) {
    for (const attachment of (message.attachments ?? []).filter(
      isImportableAttachment,
    )) {
      try {
        const content = isNonEmptyString(attachment.content)
          ? Buffer.from(attachment.content, 'base64')
          : await downloadUnipileMessageAttachment({
              accountId: unipileAccountId,
              chatId: message.chat_id,
              messageId: message.id,
              attachmentId: attachment.id,
            });

        files.push({
          messageExternalId: message.id,
          attachmentId: attachment.id,
          type: attachment.type,
          mimeType: attachment.mimetype,
          content,
        });
      } catch (error) {
        if (error instanceof UnipileRateLimitError) {
          throw error;
        }

        console.warn(
          `[linkedin] attachment ${attachment.id} of message ${message.id} not imported: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return files;
};
