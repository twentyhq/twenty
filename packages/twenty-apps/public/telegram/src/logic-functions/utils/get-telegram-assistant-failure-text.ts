import { TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-deadline-failure-text';
import { TELEGRAM_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-empty-response-failure-text';
import { TELEGRAM_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-failure-text';
import { TelegramAssistantDeadlineError } from 'src/logic-functions/types/telegram-assistant-deadline-error';
import { TelegramAssistantEmptyResponseError } from 'src/logic-functions/types/telegram-assistant-empty-response-error';

export const getTelegramAssistantFailureText = (error: unknown): string => {
  if (error instanceof TelegramAssistantDeadlineError) {
    return TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT;
  }

  if (error instanceof TelegramAssistantEmptyResponseError) {
    return TELEGRAM_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT;
  }

  return TELEGRAM_ASSISTANT_FAILURE_TEXT;
};
