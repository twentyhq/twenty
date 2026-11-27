import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_ASSISTANT_ATTACHMENT_MIME_TYPES } from 'src/logic-functions/constants/telegram-assistant-attachment-mime-types';
import { TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/telegram-assistant-max-attachment-size-bytes';
import { type TelegramInboundAttachment } from 'src/logic-functions/types/telegram-inbound-attachment.type';

export const isTelegramAttachmentReadable = ({
  mimeType,
  sizeBytes,
}: TelegramInboundAttachment): boolean =>
  isDefined(mimeType) &&
  TELEGRAM_ASSISTANT_ATTACHMENT_MIME_TYPES.includes(mimeType) &&
  (!isNumber(sizeBytes) ||
    sizeBytes <= TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES);
