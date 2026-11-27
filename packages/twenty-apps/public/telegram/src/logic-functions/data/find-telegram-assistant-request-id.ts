import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findTelegramAssistantRequestId = async ({
  client,
  telegramChatId,
  telegramMessageId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  telegramChatId: string;
  telegramMessageId: string;
}): Promise<string | undefined> => {
  const queryResult = await client.query({
    telegramAssistantRequests: {
      __args: {
        filter: {
          telegramChatId: { eq: telegramChatId },
          telegramMessageId: { eq: telegramMessageId },
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  const requestId = queryResult.telegramAssistantRequests?.edges?.[0]?.node?.id;

  return isNonEmptyString(requestId) ? requestId : undefined;
};
