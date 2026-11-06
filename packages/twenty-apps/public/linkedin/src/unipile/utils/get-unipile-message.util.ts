import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const getUnipileMessage = async ({
  accountId,
  chatId,
  messageId,
}: {
  accountId: string;
  chatId: string;
  messageId: string;
}): Promise<UnipileMessage> => {
  const { data } = await requestUnipile('get message', () =>
    new UnipileMessaging().getMessage({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, chat_id: chatId, message_id: messageId },
    }),
  );

  return data;
};
