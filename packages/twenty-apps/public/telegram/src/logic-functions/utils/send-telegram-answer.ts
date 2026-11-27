import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_API_REQUEST_TIMEOUT_MS } from 'src/logic-functions/constants/telegram-api-request-timeout-ms';
import { TELEGRAM_SEND_RETRY_MAX_WAIT_SECONDS } from 'src/logic-functions/constants/telegram-send-retry-max-wait-seconds';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { type TelegramInlineKeyboardMarkup } from 'src/logic-functions/types/telegram-inline-keyboard-markup.type';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

const RATE_LIMITED_ERROR_CODE = 429;

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRetryDelaySeconds = (error: unknown): number | undefined => {
  if (
    !(error instanceof TelegramApiError) ||
    error.errorCode !== RATE_LIMITED_ERROR_CODE ||
    !isNumber(error.retryAfterSeconds) ||
    error.retryAfterSeconds > TELEGRAM_SEND_RETRY_MAX_WAIT_SECONDS
  ) {
    return undefined;
  }

  return error.retryAfterSeconds;
};

const callBeforeDeadlineOrThrow = async ({
  botToken,
  method,
  params,
  deadlineAtMs,
}: {
  botToken: string;
  method: string;
  params: Record<string, unknown>;
  deadlineAtMs: number;
}): Promise<void> => {
  const remainingMs = deadlineAtMs - Date.now();

  if (remainingMs <= 0) {
    throw new TelegramApiError({
      method,
      description: 'no time left to reach Telegram',
    });
  }

  await callTelegramApiOrThrow({
    botToken,
    method,
    params,
    timeoutMs: Math.min(remainingMs, TELEGRAM_API_REQUEST_TIMEOUT_MS),
  });
};

const callOnceMoreWhenRateLimited = async (
  call: Parameters<typeof callBeforeDeadlineOrThrow>[0],
): Promise<void> => {
  try {
    await callBeforeDeadlineOrThrow(call);
  } catch (error) {
    const retryDelaySeconds = getRetryDelaySeconds(error);

    if (
      !isDefined(retryDelaySeconds) ||
      Date.now() + retryDelaySeconds * 1000 >= call.deadlineAtMs
    ) {
      throw error;
    }

    await sleep(retryDelaySeconds * 1000);
    await callBeforeDeadlineOrThrow(call);
  }
};

export const sendTelegramAnswer = async ({
  botToken,
  chatId,
  richText,
  plainText,
  replyMarkup,
  deadlineAtMs,
}: {
  botToken: string;
  chatId: number;
  richText: string;
  plainText: string;
  replyMarkup: TelegramInlineKeyboardMarkup;
  deadlineAtMs: number;
}): Promise<void> => {
  try {
    await callOnceMoreWhenRateLimited({
      botToken,
      method: 'sendRichMessage',
      params: {
        chat_id: chatId,
        rich_message: { markdown: richText },
        reply_markup: replyMarkup,
      },
      deadlineAtMs,
    });
  } catch (error) {
    if (
      !(error instanceof TelegramApiError) ||
      error.errorCode === RATE_LIMITED_ERROR_CODE
    ) {
      throw error;
    }

    console.warn('[telegram] rich message refused, sending plain text', error);

    await callOnceMoreWhenRateLimited({
      botToken,
      method: 'sendMessage',
      params: { chat_id: chatId, text: plainText, reply_markup: replyMarkup },
      deadlineAtMs,
    });
  }
};
