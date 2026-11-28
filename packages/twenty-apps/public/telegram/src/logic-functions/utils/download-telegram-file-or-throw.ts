import { isNonEmptyString, isNumber } from '@sniptt/guards';

import { TELEGRAM_API_BASE_URL } from 'src/logic-functions/constants/telegram-api-base-url';
import { TELEGRAM_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/telegram-assistant-attachment-download-timeout-ms';
import { TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/telegram-assistant-max-attachment-size-bytes';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

const FILE_OVER_SIZE_LIMIT_MESSAGE = 'the file is over the size limit';

export const downloadTelegramFileOrThrow = async ({
  botToken,
  telegramFileId,
}: {
  botToken: string;
  telegramFileId: string;
}): Promise<Uint8Array<ArrayBuffer>> => {
  const file = await callTelegramApiOrThrow<{
    file_path?: string;
    file_size?: number;
  }>({
    botToken,
    method: 'getFile',
    params: { file_id: telegramFileId },
  });

  if (!isNonEmptyString(file.file_path)) {
    throw new Error('Telegram did not return a path for the file');
  }

  if (
    isNumber(file.file_size) &&
    file.file_size > TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES
  ) {
    throw new Error(FILE_OVER_SIZE_LIMIT_MESSAGE);
  }

  const response = await fetch(
    `${TELEGRAM_API_BASE_URL}/file/bot${botToken}/${file.file_path}`,
    {
      signal: AbortSignal.timeout(
        TELEGRAM_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS,
      ),
    },
  ).catch(() => {
    throw new Error('the file download did not reach Telegram');
  });

  if (!response.ok) {
    throw new Error(`the file download failed with status ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength > TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error(FILE_OVER_SIZE_LIMIT_MESSAGE);
  }

  return bytes;
};
