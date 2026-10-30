import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipilePage } from 'src/unipile/types/unipile-page.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

// LinkedIn refuses the account-wide chat list, so chats are listed per inbox, most recently active first
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
  const { data } = await new UnipileMessaging().getInboxChatsList({
    ...getUnipileRequestOptions(),
    path: { account_id: accountId, inbox_id: inboxId },
    query: { cursor, limit },
  });

  return {
    items: data.data,
    nextCursor: data.next_cursor,
    totalCount: data.total_count,
  };
};
