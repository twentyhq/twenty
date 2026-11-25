import { type SendAppMessageAttachment } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_OUTGOING_MEDIA_TYPES } from 'src/constants/whatsapp-outgoing-media-types.constant';

export const getWhatsAppOutgoingMediaTypeOrThrow = ({
  filename,
  contentType,
  size,
}: Pick<SendAppMessageAttachment, 'filename' | 'contentType' | 'size'>) => {
  const mediaType = WHATSAPP_OUTGOING_MEDIA_TYPES[contentType.split(';')[0]?.trim().toLowerCase() ?? ''];

  if (!isDefined(mediaType)) {
    throw new Error(`WhatsApp can't send ${filename}: ${contentType} files are not supported`);
  }

  if (size > mediaType.maxSizeBytes) {
    throw new Error(
      `WhatsApp can't send ${filename}: ${mediaType.messageType} files are limited to ${mediaType.maxSizeBytes / (1024 * 1024)} MB`,
    );
  }

  return mediaType.messageType;
};
