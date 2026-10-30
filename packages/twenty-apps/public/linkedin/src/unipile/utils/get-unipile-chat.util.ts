import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { withUnipileErrorContext } from 'src/unipile/utils/with-unipile-error-context.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const getUnipileChat = async ({
  accountId,
  chatId,
}: {
  accountId: string;
  chatId: string;
}): Promise<UnipileChat> => {
  const { data } = await withUnipileErrorContext('get chat', () =>
    new UnipileMessaging().getChat({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, chat_id: chatId },
    }),
  );

  return data;
};
