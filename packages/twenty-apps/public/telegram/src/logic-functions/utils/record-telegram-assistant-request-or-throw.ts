import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { createTelegramAssistantRequestOrThrow } from 'src/logic-functions/data/create-telegram-assistant-request-or-throw';
import { findTelegramAssistantRequestId } from 'src/logic-functions/data/find-telegram-assistant-request-id';
import { buildTelegramAssistantRequestName } from 'src/logic-functions/utils/build-telegram-assistant-request-name';
import { isDuplicateRecordError } from 'src/logic-functions/utils/is-duplicate-record-error';

export const recordTelegramAssistantRequestOrThrow = async ({
  client,
  telegramChatId,
  telegramMessageId,
  telegramUserId,
  workspaceMemberId,
  requestText,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  telegramChatId: string;
  telegramMessageId: string;
  telegramUserId: string;
  workspaceMemberId: string;
  requestText: string;
}): Promise<string> => {
  try {
    return await createTelegramAssistantRequestOrThrow({
      client,
      name: buildTelegramAssistantRequestName(requestText),
      telegramChatId,
      telegramMessageId,
      telegramUserId,
      workspaceMemberId,
      requestText,
    });
  } catch (error) {
    if (!isDuplicateRecordError(error)) {
      throw error;
    }

    const existingRequestId = await findTelegramAssistantRequestId({
      client,
      telegramChatId,
      telegramMessageId,
    });

    if (!isDefined(existingRequestId)) {
      throw error;
    }

    return existingRequestId;
  }
};
