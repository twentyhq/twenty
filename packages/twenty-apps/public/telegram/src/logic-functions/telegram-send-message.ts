import { isNonEmptyString, isString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_FORBIDDEN_ERROR_CODE } from 'src/logic-functions/constants/telegram-forbidden-error-code';
import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { TELEGRAM_SEND_MESSAGE_INPUT_SCHEMA } from 'src/logic-functions/constants/telegram-send-message-input-schema';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { type TelegramSendMessageResult } from 'src/logic-functions/types/telegram-send-message-result.type';
import { disconnectTelegramUser } from 'src/logic-functions/utils/disconnect-telegram-user';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';
import { sendTelegramMessage } from 'src/logic-functions/utils/send-telegram-message';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

export const telegramSendMessageHandler = async ({
  workspaceMemberId,
  text,
}: {
  workspaceMemberId?: unknown;
  text?: unknown;
}): Promise<TelegramSendMessageResult> => {
  if (!isNonEmptyString(workspaceMemberId)) {
    return { success: false, error: 'workspaceMemberId is required.' };
  }

  if (!isString(text) || !isNonEmptyString(text.trim())) {
    return { success: false, error: 'text is required and cannot be empty.' };
  }

  if (text.length > TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: `text is too long: Telegram accepts at most ${TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH} characters, got ${text.length}.`,
    };
  }

  const credentialsResult = getTelegramBotCredentials();

  if (!credentialsResult.success) {
    return { success: false, error: credentialsResult.error };
  }

  try {
    const client = new CoreApiClient({ runAs: 'application' });
    const links = await findTelegramUserLinks({
      client,
      filter: { workspaceMemberId },
    });
    const telegramUserId = links
      .map((link) => link.telegramUserId)
      .find(isDefined);

    if (!isDefined(telegramUserId)) {
      return {
        success: false,
        error:
          'This workspace member has not connected a Telegram account to Twenty.',
      };
    }

    try {
      const message = await sendTelegramMessage({
        botToken: credentialsResult.credentials.botToken,
        chatId: Number(telegramUserId),
        text,
      });

      return { success: true, messageId: message.message_id };
    } catch (error) {
      if (
        !(error instanceof TelegramApiError) ||
        error.errorCode !== TELEGRAM_FORBIDDEN_ERROR_CODE
      ) {
        throw error;
      }

      await disconnectTelegramUser({ client, telegramUserId });

      return {
        success: false,
        error:
          'This workspace member blocked the Telegram bot. Their Telegram account was disconnected from Twenty.',
      };
    }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'telegram-send-message',
  description:
    'Sends a plain text direct message from the Telegram bot to a workspace member who connected their Telegram account to Twenty.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: TELEGRAM_SEND_MESSAGE_INPUT_SCHEMA,
  },
  workflowActionTriggerSettings: {
    label: 'Send Telegram Message',
    icon: 'IconBrandTelegram',
    inputSchema: jsonSchemaToInputSchema(TELEGRAM_SEND_MESSAGE_INPUT_SCHEMA),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          messageId: { type: 'number' },
        },
      },
    ],
  },
  handler: telegramSendMessageHandler,
});
