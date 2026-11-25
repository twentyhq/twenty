import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TelegramAssistantRequestStatus } from 'src/logic-functions/types/telegram-assistant-request-status.type';

export const updateTelegramAssistantRequest = async ({
  client,
  id,
  status,
  responseText,
  errorMessage,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  status: TelegramAssistantRequestStatus;
  responseText?: string;
  errorMessage?: string;
}): Promise<void> => {
  await client.mutation({
    updateTelegramAssistantRequest: {
      __args: {
        id,
        data: {
          status,
          ...(isDefined(responseText)
            ? { responseText: { blocknote: null, markdown: responseText } }
            : {}),
          ...(isDefined(errorMessage) ? { errorMessage } : {}),
        },
      },
      id: true,
    },
  });
};
