import { isNumber } from '@sniptt/guards';

import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { TELEGRAM_SEND_RETRY_MAX_WAIT_SECONDS } from 'src/logic-functions/constants/telegram-send-retry-max-wait-seconds';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

const RATE_LIMITED_ERROR_CODE = 429;

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRetryDelaySeconds = (error: unknown): number | undefined =>
  error instanceof TelegramApiError &&
  error.errorCode === RATE_LIMITED_ERROR_CODE &&
  isNumber(error.retryAfterSeconds) &&
  error.retryAfterSeconds <= TELEGRAM_SEND_RETRY_MAX_WAIT_SECONDS
    ? error.retryAfterSeconds
    : undefined;

const callOnceMoreWhenRateLimited = async (
  call: () => Promise<unknown>,
): Promise<void> => {
  try {
    await call();
  } catch (error) {
    const retryDelaySeconds = getRetryDelaySeconds(error);

    if (!isNumber(retryDelaySeconds)) {
      throw error;
    }

    await sleep(retryDelaySeconds * 1000);
    await call();
  }
};

export const sendTelegramAnswer = async ({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: number;
  text: string;
}): Promise<void> => {
  try {
    await callOnceMoreWhenRateLimited(() =>
      callTelegramApiOrThrow({
        botToken,
        method: 'sendRichMessage',
        params: { chat_id: chatId, rich_message: { markdown: text } },
      }),
    );
  } catch (error) {
    if (
      !(error instanceof TelegramApiError) ||
      error.errorCode === RATE_LIMITED_ERROR_CODE
    ) {
      throw error;
    }

    console.warn('[telegram] rich message refused, sending plain text', error);

    await callOnceMoreWhenRateLimited(() =>
      callTelegramApiOrThrow({
        botToken,
        method: 'sendMessage',
        params: {
          chat_id: chatId,
          text: [...text].slice(0, TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH).join(''),
        },
      }),
    );
  }
};
