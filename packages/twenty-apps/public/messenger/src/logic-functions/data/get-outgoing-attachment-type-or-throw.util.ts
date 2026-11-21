import { type SendAppMessageAttachment } from 'twenty-sdk/logic-function';

import { MESSENGER_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/messenger-attachment-max-size-bytes.constant';
import { type MessengerOutgoingAttachmentType } from 'src/logic-functions/types/messenger-outgoing-attachment-type.type';

const getAttachmentType = (
  contentType: string,
): MessengerOutgoingAttachmentType => {
  const [mediaType] = contentType.split('/');

  return mediaType === 'image' || mediaType === 'video' || mediaType === 'audio'
    ? mediaType
    : 'file';
};

export const getOutgoingAttachmentTypeOrThrow = ({
  filename,
  contentType,
  size,
}: Pick<
  SendAppMessageAttachment,
  'filename' | 'contentType' | 'size'
>): MessengerOutgoingAttachmentType => {
  const attachmentType = getAttachmentType(contentType);
  const maxSizeBytes =
    attachmentType === 'image'
      ? MESSENGER_ATTACHMENT_MAX_SIZE_BYTES.image
      : MESSENGER_ATTACHMENT_MAX_SIZE_BYTES.other;

  if (size > maxSizeBytes) {
    throw new Error(
      `${filename} is too large for Messenger, which accepts up to ${maxSizeBytes / 1024 / 1024} MB for this file type`,
    );
  }

  return attachmentType;
};
