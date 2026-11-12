import { isDefined } from 'twenty-sdk/utils';

import { type SendAppMessageAttachment } from 'src/types/send-app-message-attachment.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { readStreamWithinSizeLimitOrThrow } from 'src/utils/read-stream-within-size-limit.util';

export const downloadSendMessageAttachmentOrThrow = async ({
  attachment: { filename, contentType, size, downloadUrl },
  maxSizeBytes,
  deadlineAtMs,
}: {
  attachment: SendAppMessageAttachment;
  maxSizeBytes: number;
  deadlineAtMs: number;
}): Promise<UnipileOutgoingAttachment> => {
  if (size > maxSizeBytes) {
    throw new Error(
      `Attachment ${filename} is larger than ${maxSizeBytes} bytes`,
    );
  }

  const response = await fetch(downloadUrl, {
    signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
  });

  if (!response.ok || !isDefined(response.body)) {
    throw new Error(
      `Downloading attachment ${filename} failed (${response.status})`,
    );
  }

  const content = await readStreamWithinSizeLimitOrThrow({
    stream: response.body,
    maxSizeBytes,
  });

  return {
    content: content.toString('base64'),
    content_type: contentType,
    filename,
  };
};
