import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipilePage } from 'src/unipile/types/unipile-page.type';
import { withUnipileErrorContext } from 'src/unipile/utils/with-unipile-error-context.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const listUnipileChats = async ({
  accountId,
  inboxId,
  cursor,
  limit,
}: {
  accountId: string;
  inboxId: string;
  cursor?: string;
  limit: number;
}): Promise<UnipilePage<UnipileChat>> => {
  const { data } = await withUnipileErrorContext('list inbox chats', () =>
    new UnipileMessaging().getInboxChatsList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, inbox_id: inboxId },
      query: { cursor, limit },
    }),
  );

  return {
    items: data.data,
    nextCursor: data.next_cursor,
    totalCount: data.total_count,
  };
};
