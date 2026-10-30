import { isNonEmptyString } from '@sniptt/guards';

import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';

const UNIPILE_CHAT_IDS_PAGE_SIZE = 20;

const UNIPILE_CHAT_IDS_MAX_PAGES_PER_INBOX = 2500;

export const listUnipileChatIds = async ({
  accountId,
  inboxIds,
}: {
  accountId: string;
  inboxIds: string[];
}): Promise<string[]> => {
  const chatIds = new Set<string>();

  for (const inboxId of inboxIds) {
    let cursor: string | undefined;

    for (
      let pageIndex = 0;
      pageIndex < UNIPILE_CHAT_IDS_MAX_PAGES_PER_INBOX;
      pageIndex++
    ) {
      const page = await listUnipileChats({
        accountId,
        inboxId,
        cursor,
        limit: UNIPILE_CHAT_IDS_PAGE_SIZE,
      });

      page.items.forEach((chat) => chatIds.add(chat.id));

      if (
        page.items.length === 0 ||
        !isNonEmptyString(page.nextCursor) ||
        page.nextCursor === cursor
      ) {
        break;
      }

      cursor = page.nextCursor;
    }
  }

  return [...chatIds];
};
