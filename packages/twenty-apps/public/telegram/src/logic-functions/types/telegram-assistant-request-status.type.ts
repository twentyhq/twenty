import { type TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';

export type TelegramAssistantRequestStatus =
  (typeof TELEGRAM_ASSISTANT_REQUEST_STATUS)[keyof typeof TELEGRAM_ASSISTANT_REQUEST_STATUS];
