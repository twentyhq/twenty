import { isNonEmptyString } from '@sniptt/guards';

import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';

const UNIPILE_CHAT_COUNT_PAGE_SIZE = 100;

// Guards against a provider that keeps returning a cursor
const UNIPILE_CHAT_COUNT_MAX_PAGES = 500;

// LinkedIn returns no total, so progress needs one walk over the chat list (no messages fetched)
export const countUnipileChats = async (accountId: string): Promise<number> => {
  let count = 0;
  let cursor: string | undefined;
  let pageCount = 0;

  do {
    const page = await listUnipileChats({
      accountId,
      cursor,
      limit: UNIPILE_CHAT_COUNT_PAGE_SIZE,
    });

    if (pageCount === 0 && page.totalCount !== undefined) {
      return page.totalCount;
    }

    count += page.items.length;
    cursor = page.nextCursor;
    pageCount += 1;
  } while (
    isNonEmptyString(cursor) &&
    pageCount < UNIPILE_CHAT_COUNT_MAX_PAGES
  );

  return count;
};
