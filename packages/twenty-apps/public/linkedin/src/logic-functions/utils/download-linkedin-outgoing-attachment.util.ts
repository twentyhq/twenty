import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';
import { type LinkedinOutgoingAttachment } from 'src/logic-functions/types/linkedin-outgoing-attachment.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';

const assertWithinMaxSizeOrThrow = (filename: string, sizeBytes: number) => {
  if (sizeBytes > LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES) {
    throw new Error(
      `Attachment ${filename} is larger than ${LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES} bytes`,
    );
  }
};

export const downloadLinkedinOutgoingAttachment = async ({
  filename,
  mimeType,
  size,
  url,
}: LinkedinOutgoingAttachment): Promise<UnipileOutgoingAttachment> => {
  assertWithinMaxSizeOrThrow(filename, size);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Attachment ${filename} could not be downloaded from Twenty (${response.status})`,
    );
  }

  const content = Buffer.from(await response.arrayBuffer());

  assertWithinMaxSizeOrThrow(filename, content.byteLength);

  return {
    filename,
    content_type: mimeType,
    content: content.toString('base64'),
  };
};
