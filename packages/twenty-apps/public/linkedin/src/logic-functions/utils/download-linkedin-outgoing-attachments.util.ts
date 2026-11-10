import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';
import { type LinkedinSendMessageAttachment } from 'src/logic-functions/types/linkedin-send-message-payload.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';

const assertWithinSizeLimit = (sizeBytes: number): void => {
  if (sizeBytes > LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES) {
    throw new Error(
      `Attachments are larger than ${LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES} bytes in total`,
    );
  }
};

export const downloadLinkedinOutgoingAttachments = async ({
  attachments,
  deadlineAtMs,
}: {
  attachments: LinkedinSendMessageAttachment[];
  deadlineAtMs: number;
}): Promise<UnipileOutgoingAttachment[]> => {
  assertWithinSizeLimit(
    attachments.reduce((totalSize, { size }) => totalSize + size, 0),
  );

  const downloadedAttachments = await Promise.all(
    attachments.map(async ({ filename, mimeType, url }) => {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
      });

      if (!response.ok) {
        throw new Error(
          `Download of attachment ${filename} failed with status ${response.status}`,
        );
      }

      return {
        filename,
        contentType: mimeType,
        content: Buffer.from(await response.arrayBuffer()),
      };
    }),
  );

  // the declared sizes are only a first guard: the downloaded bytes are what Unipile receives
  assertWithinSizeLimit(
    downloadedAttachments.reduce(
      (totalSize, { content }) => totalSize + content.byteLength,
      0,
    ),
  );

  return downloadedAttachments;
};
