import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';
import { sortUnipileChatsByLastMessage } from 'src/unipile/utils/sort-unipile-chats-by-last-message.util';

export const listMostRecentUnipileChats = async ({
  accountId,
  limit,
  deadlineAtMs,
}: {
  accountId: string;
  limit: number;
  deadlineAtMs?: number;
}): Promise<UnipileChat[]> => {
  // Keyed by id: a chat can come back on two pages when one moves between the requests
  const chatById = new Map<string, UnipileChat>();
  let cursor: string | undefined;

  while (chatById.size < limit) {
    const page = await listUnipileChats({
      accountId,
      cursor,
      limit: limit - chatById.size,
      deadlineAtMs,
    });

    for (const chat of page.items) {
      chatById.set(chat.id, chat);
    }

    if (
      page.items.length === 0 ||
      !isNonEmptyString(page.nextCursor) ||
      page.nextCursor === cursor
    ) {
      break;
    }

    cursor = page.nextCursor;
  }

  return sortUnipileChatsByLastMessage([...chatById.values()]).slice(0, limit);
};
