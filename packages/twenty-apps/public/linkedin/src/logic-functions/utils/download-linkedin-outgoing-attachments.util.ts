import { LINKEDIN_OUTGOING_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES } from 'src/constants/linkedin-outgoing-attachments-max-total-size-bytes.constant';
import { type LinkedinOutgoingAttachment } from 'src/logic-functions/types/linkedin-outgoing-attachment.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';

const assertWithinMaxTotalSizeOrThrow = (totalSizeBytes: number) => {
  if (totalSizeBytes > LINKEDIN_OUTGOING_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES) {
    throw new Error(
      `Attachments total ${totalSizeBytes} bytes, more than the ${LINKEDIN_OUTGOING_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES} bytes LinkedIn accepts in one message`,
    );
  }
};

export const downloadLinkedinOutgoingAttachments = async (
  attachments: LinkedinOutgoingAttachment[],
): Promise<UnipileOutgoingAttachment[]> => {
  assertWithinMaxTotalSizeOrThrow(
    attachments.reduce((totalSize, { size }) => totalSize + size, 0),
  );

  const unipileAttachments: UnipileOutgoingAttachment[] = [];
  let downloadedSizeBytes = 0;

  for (const { filename, mimeType, url } of attachments) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Attachment ${filename} could not be downloaded from Twenty (${response.status})`,
      );
    }

    const content = Buffer.from(await response.arrayBuffer());

    downloadedSizeBytes += content.byteLength;
    assertWithinMaxTotalSizeOrThrow(downloadedSizeBytes);

    unipileAttachments.push({
      filename,
      content_type: mimeType,
      content: content.toString('base64'),
    });
  }

  return unipileAttachments;
};
