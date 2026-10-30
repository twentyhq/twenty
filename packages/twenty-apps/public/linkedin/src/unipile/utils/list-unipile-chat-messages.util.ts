import { isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { withUnipileErrorContext } from 'src/unipile/utils/with-unipile-error-context.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

// Unipile's documented default; larger pages are not accepted by every provider
const UNIPILE_MESSAGES_PAGE_SIZE = 20;

// A chat with more messages than this is cut, rather than letting a cursor that never ends eat the job timeout
const UNIPILE_MESSAGES_MAX_PAGES = 250;

export const listUnipileChatMessages = async ({
  accountId,
  chatId,
}: {
  accountId: string;
  chatId: string;
}): Promise<UnipileMessage[]> => {
  const messages: UnipileMessage[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < UNIPILE_MESSAGES_MAX_PAGES; pageIndex++) {
    const { data } = await withUnipileErrorContext('list chat messages', () =>
      new UnipileMessaging().getMessagesList({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId, chat_id: chatId },
        query: { cursor, limit: UNIPILE_MESSAGES_PAGE_SIZE },
      }),
    );

    messages.push(...data.data);
    cursor = data.next_cursor;

    if (
      data.data.length === 0 ||
      !isNonEmptyString(cursor) ||
      seenCursors.has(cursor)
    ) {
      break;
    }

    seenCursors.add(cursor);
  }

  return messages;
};
