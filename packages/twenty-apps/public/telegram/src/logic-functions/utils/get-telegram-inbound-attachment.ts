import { isDefined } from 'twenty-sdk/utils';

import { type TelegramInboundAttachment } from 'src/logic-functions/types/telegram-inbound-attachment.type';
import { type TelegramMessage } from 'src/logic-functions/types/telegram-message.type';

const PHOTO_FILE_NAME = 'photo.jpg';
const PHOTO_MIME_TYPE = 'image/jpeg';
const DOCUMENT_FILE_NAME = 'document';

export const getTelegramInboundAttachment = (
  message: TelegramMessage,
): TelegramInboundAttachment | undefined => {
  if (isDefined(message.document)) {
    return {
      telegramFileId: message.document.file_id,
      fileName: message.document.file_name ?? DOCUMENT_FILE_NAME,
      mimeType: message.document.mime_type,
      sizeBytes: message.document.file_size,
    };
  }

  const largestPhoto = [...(message.photo ?? [])].pop();

  if (!isDefined(largestPhoto)) {
    return undefined;
  }

  return {
    telegramFileId: largestPhoto.file_id,
    fileName: PHOTO_FILE_NAME,
    mimeType: PHOTO_MIME_TYPE,
    sizeBytes: largestPhoto.file_size,
  };
};
