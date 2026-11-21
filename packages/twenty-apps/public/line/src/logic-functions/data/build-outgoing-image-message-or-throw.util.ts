import { type SendAppMessageAttachment } from 'twenty-sdk/logic-function';

import { LINE_OUTGOING_IMAGE_LIMITS } from 'src/constants/line-outgoing-image-limits.constant';
import { type LineOutgoingMessage } from 'src/logic-functions/types/line-outgoing-message.type';

const isAllowedContentType = (contentType: string) =>
  LINE_OUTGOING_IMAGE_LIMITS.contentTypes.some(
    (allowedContentType) =>
      contentType.split(';')[0]?.trim().toLowerCase() === allowedContentType,
  );

// LINE has no upload API: it fetches the image from the signed URL, which must be public HTTPS
export const buildOutgoingImageMessageOrThrow = ({
  filename,
  contentType,
  size,
  downloadUrl,
}: SendAppMessageAttachment): LineOutgoingMessage => {
  if (!isAllowedContentType(contentType)) {
    throw new Error(
      `${filename} cannot be sent on LINE. LINE replies from Twenty can carry JPEG or PNG images only.`,
    );
  }

  if (size > LINE_OUTGOING_IMAGE_LIMITS.maxSizeBytes) {
    throw new Error(
      `${filename} is too large for LINE, which accepts images up to ${LINE_OUTGOING_IMAGE_LIMITS.maxSizeBytes / 1024 / 1024} MB.`,
    );
  }

  if (
    !downloadUrl.startsWith('https://') ||
    downloadUrl.length > LINE_OUTGOING_IMAGE_LIMITS.maxUrlLength
  ) {
    throw new Error(
      `${filename} cannot be sent on LINE, which fetches images from a public HTTPS address. Twenty must be served over HTTPS.`,
    );
  }

  return {
    type: 'image',
    originalContentUrl: downloadUrl,
    previewImageUrl: downloadUrl,
  };
};
