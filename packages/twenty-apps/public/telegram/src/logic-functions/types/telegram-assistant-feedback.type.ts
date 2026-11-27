import { type TELEGRAM_ASSISTANT_FEEDBACK } from 'src/logic-functions/constants/telegram-assistant-feedback';

export type TelegramAssistantFeedback =
  (typeof TELEGRAM_ASSISTANT_FEEDBACK)[keyof typeof TELEGRAM_ASSISTANT_FEEDBACK];
