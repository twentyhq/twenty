import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';
import { sortUnipileChatsByLastMessage } from 'src/unipile/utils/sort-unipile-chats-by-last-message.util';

const listMostRecentInboxChats = async ({
  accountId,
  inboxId,
  limit,
  deadlineAtMs,
}: {
  accountId: string;
  inboxId: string;
  limit: number;
  deadlineAtMs?: number;
}): Promise<UnipileChat[]> => {
  const chats: UnipileChat[] = [];
  let cursor: string | undefined;

  while (chats.length < limit) {
    const page = await listUnipileChats({
      accountId,
      inboxId,
      cursor,
      limit: limit - chats.length,
      deadlineAtMs,
    });

    chats.push(...page.items);

    if (
      page.items.length === 0 ||
      !isNonEmptyString(page.nextCursor) ||
      page.nextCursor === cursor
    ) {
      break;
    }

    cursor = page.nextCursor;
  }

  return chats;
};

export const listMostRecentUnipileChats = async ({
  accountId,
  inboxIds,
  limit,
  deadlineAtMs,
}: {
  accountId: string;
  inboxIds: string[];
  limit: number;
  deadlineAtMs?: number;
}): Promise<UnipileChat[]> => {
  const chats: UnipileChat[] = [];

  for (const inboxId of inboxIds) {
    chats.push(
      ...(await listMostRecentInboxChats({
        accountId,
        inboxId,
        limit,
        deadlineAtMs,
      })),
    );
  }

  return sortUnipileChatsByLastMessage(chats).slice(0, limit);
};
