import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipilePage } from 'src/unipile/types/unipile-page.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

// Chats come most recently active first
export const listUnipileChats = async ({
  accountId,
  cursor,
  limit,
}: {
  accountId: string;
  cursor?: string;
  limit: number;
}): Promise<UnipilePage<UnipileChat>> => {
  const { data } = await new UnipileMessaging().getChatsList({
    ...getUnipileRequestOptions(),
    path: { account_id: accountId },
    query: { cursor, limit },
  });

  return { items: data.data, nextCursor: data.next_cursor };
};
