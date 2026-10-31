import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipilePage } from 'src/unipile/types/unipile-page.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

const UNIPILE_MESSAGES_PAGE_SIZE = 20;

export const listUnipileChatMessagesPage = async ({
  accountId,
  chatId,
  cursor,
}: {
  accountId: string;
  chatId: string;
  cursor?: string;
}): Promise<UnipilePage<UnipileMessage>> => {
  const { data } = await requestUnipile('list chat messages', () =>
    new UnipileMessaging().getMessagesList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, chat_id: chatId },
      query: { cursor, limit: UNIPILE_MESSAGES_PAGE_SIZE },
    }),
  );

  return { items: data.data, nextCursor: data.next_cursor };
};
