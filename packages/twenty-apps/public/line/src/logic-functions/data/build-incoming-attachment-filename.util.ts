import { isNonEmptyString } from '@sniptt/guards';

import { type LineMessage } from 'src/logic-functions/types/line-webhook.type';

const ATTACHMENT_FILENAME_MAX_LENGTH = 255;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
};

// keeps the extension, which is what tells a reader the file type
const truncateFilename = (filename: string) =>
  filename.length <= ATTACHMENT_FILENAME_MAX_LENGTH
    ? filename
    : filename.slice(-ATTACHMENT_FILENAME_MAX_LENGTH);

export const buildIncomingAttachmentFilename = ({
  message,
  contentType,
}: {
  message: LineMessage;
  contentType: string | null;
}): string => {
  if (message.type === 'file' && isNonEmptyString(message.fileName.trim())) {
    return truncateFilename(message.fileName.trim());
  }

  const mimeType = contentType?.split(';')[0]?.trim().toLowerCase();
  const extension = isNonEmptyString(mimeType)
    ? EXTENSION_BY_CONTENT_TYPE[mimeType]
    : undefined;
  const basename = `line-${message.type}-${message.id}`;

  return truncateFilename(
    isNonEmptyString(extension) ? `${basename}.${extension}` : basename,
  );
};
