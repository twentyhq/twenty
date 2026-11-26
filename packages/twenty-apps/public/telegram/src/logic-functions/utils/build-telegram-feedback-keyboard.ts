import { TELEGRAM_ASSISTANT_FEEDBACK } from 'src/logic-functions/constants/telegram-assistant-feedback';
import { TELEGRAM_FEEDBACK_CALLBACK_PREFIX } from 'src/logic-functions/constants/telegram-feedback-callback-prefix';

const FEEDBACK_BUTTON_TEXTS = {
  [TELEGRAM_ASSISTANT_FEEDBACK.POSITIVE]: '\u{1F44D}',
  [TELEGRAM_ASSISTANT_FEEDBACK.NEGATIVE]: '\u{1F44E}',
};

export const buildTelegramFeedbackKeyboard = (requestId: string) => ({
  inline_keyboard: [
    Object.values(TELEGRAM_ASSISTANT_FEEDBACK).map((feedback) => ({
      text: FEEDBACK_BUTTON_TEXTS[feedback],
      callback_data: `${TELEGRAM_FEEDBACK_CALLBACK_PREFIX}:${feedback}:${requestId}`,
    })),
  ],
});
