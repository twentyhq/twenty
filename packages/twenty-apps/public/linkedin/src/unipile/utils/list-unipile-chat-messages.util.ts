import { isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

const UNIPILE_MESSAGES_PAGE_SIZE = 100;

// A chat with more messages than this is cut, rather than letting a cursor that never ends eat the job timeout
const UNIPILE_MESSAGES_MAX_PAGES = 50;

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
    const { data } = await new UnipileMessaging().getMessagesList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, chat_id: chatId },
      query: { cursor, limit: UNIPILE_MESSAGES_PAGE_SIZE },
    });

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
