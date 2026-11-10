import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';

const ATTACHMENT_FILENAME_MAX_LENGTH = 255;

const DEFAULT_BASENAME_BY_TYPE: Record<
  UnipileMessageAttachment['type'],
  string
> = {
  img: 'linkedin-image',
  video: 'linkedin-video',
  audio: 'linkedin-audio',
  file: 'linkedin-file',
  shared_content: 'linkedin-shared-content',
  contact_card: 'linkedin-contact-card',
};

const getExtensionFromMimeType = (mimeType: string): string | undefined => {
  const subtype = mimeType.split(';')[0].split('/')[1]?.split('+')[0]?.trim();

  if (!isNonEmptyString(subtype) || !/^[a-z0-9.-]+$/i.test(subtype)) {
    return undefined;
  }

  return subtype === 'jpeg' ? 'jpg' : subtype;
};

const truncateFilename = (filename: string): string => {
  if (filename.length <= ATTACHMENT_FILENAME_MAX_LENGTH) {
    return filename;
  }

  const extensionIndex = filename.lastIndexOf('.');
  const extension =
    extensionIndex > 0 && filename.length - extensionIndex <= 16
      ? filename.slice(extensionIndex)
      : '';

  return (
    filename.slice(0, ATTACHMENT_FILENAME_MAX_LENGTH - extension.length) +
    extension
  );
};

export const buildLinkedinAttachmentFilename = (
  attachment: Pick<UnipileMessageAttachment, 'type' | 'mimetype' | 'filename'>,
): string => {
  const filename = attachment.filename?.trim();

  if (isNonEmptyString(filename)) {
    return truncateFilename(filename);
  }

  const extension = getExtensionFromMimeType(attachment.mimetype);
  const basename = DEFAULT_BASENAME_BY_TYPE[attachment.type];

  return isDefined(extension) ? `${basename}.${extension}` : basename;
};
