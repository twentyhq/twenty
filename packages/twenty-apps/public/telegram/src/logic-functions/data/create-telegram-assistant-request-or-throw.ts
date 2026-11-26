import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const createTelegramAssistantRequestOrThrow = async ({
  client,
  name,
  telegramChatId,
  telegramMessageId,
  telegramUserId,
  workspaceMemberId,
  requestText,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  name: string;
  telegramChatId: string;
  telegramMessageId: string;
  telegramUserId: string;
  workspaceMemberId: string;
  requestText: string;
}): Promise<string> => {
  const mutationResult = await client.mutation({
    createTelegramAssistantRequest: {
      __args: {
        data: {
          name,
          telegramChatId,
          telegramMessageId,
          telegramUserId,
          workspaceMemberId,
          requestText: { blocknote: null, markdown: requestText },
        },
      },
      id: true,
    },
  });

  const requestId = mutationResult.createTelegramAssistantRequest?.id;

  if (!isNonEmptyString(requestId)) {
    throw new Error('createTelegramAssistantRequest did not return an id');
  }

  return requestId;
};
