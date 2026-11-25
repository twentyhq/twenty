import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipilePage } from 'src/unipile/types/unipile-page.type';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const listUnipileChats = async ({
  accountId,
  cursor,
  limit,
  deadlineAtMs,
}: {
  accountId: string;
  cursor?: string;
  limit: number;
  deadlineAtMs?: number;
}): Promise<UnipilePage<UnipileChat>> => {
  const { data } = await requestUnipile(
    'list chats',
    () =>
      new UnipileMessaging().getChatsList({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId },
        query: { cursor, limit },
      }),
    { deadlineAtMs },
  );

  return {
    items: data.data,
    nextCursor: data.next_cursor,
    totalCount: data.total_count,
  };
};
