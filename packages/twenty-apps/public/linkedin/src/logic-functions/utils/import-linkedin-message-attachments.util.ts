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

type DownloadedAttachment = {
  attachment: UnipileMessageAttachment;
  content: Buffer;
};

const downloadAttachment = async ({
  unipileAccountId,
  message,
  attachment,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  message: UnipileMessage;
  attachment: UnipileMessageAttachment;
  deadlineAtMs: number;
}): Promise<Buffer | undefined> => {
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

  return content;
};

const warnAttachmentNotImported = ({
  attachmentId,
  messageId,
  error,
}: {
  attachmentId: string;
  messageId: string;
  error: unknown;
}) =>
  console.warn(
    `[linkedin] attachment ${attachmentId} of message ${messageId} not imported: ${error instanceof Error ? error.message : String(error)}`,
  );

const warnDeadlineReached = (message: UnipileMessage) =>
  console.warn(
    `[linkedin] chat ${message.chat_id}: attachment import reached the job deadline, files of message ${message.id} and later ones skipped`,
  );

// A message only gets attachments once, so a set cut by the deadline is dropped,
// and every file is downloaded before any upload so a dropped set leaves no stored files
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
    const downloadedAttachments: DownloadedAttachment[] = [];

    for (const attachment of (message.attachments ?? []).filter(
      isImportableAttachment,
    )) {
      if (Date.now() >= deadlineAtMs) {
        warnDeadlineReached(message);

        return importedCount;
      }

      try {
        const content = await downloadAttachment({
          unipileAccountId,
          message,
          attachment,
          deadlineAtMs,
        });

        if (isDefined(content)) {
          downloadedAttachments.push({ attachment, content });
        }
      } catch (error) {
        if (error instanceof UnipileRateLimitError) {
          throw error;
        }

        warnAttachmentNotImported({
          attachmentId: attachment.id,
          messageId: message.id,
          error,
        });
      }
    }

    if (downloadedAttachments.length === 0) {
      continue;
    }

    if (Date.now() >= deadlineAtMs) {
      warnDeadlineReached(message);

      return importedCount;
    }

    const attachments: IngestMessageAttachment[] = [];
    let hasUploadFailedAtDeadline = false;

    for (const { attachment, content } of downloadedAttachments) {
      try {
        attachments.push(
          await uploadMessageAttachment({
            filename: buildLinkedinAttachmentFilename(attachment),
            content: new Uint8Array(content),
            signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
          }),
        );
      } catch (error) {
        hasUploadFailedAtDeadline ||= Date.now() >= deadlineAtMs;

        warnAttachmentNotImported({
          attachmentId: attachment.id,
          messageId: message.id,
          error,
        });
      }
    }

    if (hasUploadFailedAtDeadline) {
      warnDeadlineReached(message);

      return importedCount;
    }

    if (attachments.length === 0) {
      continue;
    }

    try {
      await onMessageAttachments({
        messageExternalId: message.id,
        attachments,
      });
      importedCount += attachments.length;
    } catch (error) {
      console.warn(
        `[linkedin] attachments of message ${message.id} not attached: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return importedCount;
};
