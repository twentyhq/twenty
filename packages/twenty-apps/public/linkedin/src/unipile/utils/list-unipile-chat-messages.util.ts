import { isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

const UNIPILE_MESSAGES_PAGE_SIZE = 100;

export const listUnipileChatMessages = async ({
  accountId,
  chatId,
  after,
}: {
  accountId: string;
  chatId: string;
  after?: string;
}): Promise<UnipileMessage[]> => {
  const messages: UnipileMessage[] = [];
  let cursor: string | undefined;

  do {
    const { data } = await new UnipileMessaging().getMessagesList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, chat_id: chatId },
      query: { after, cursor, limit: UNIPILE_MESSAGES_PAGE_SIZE },
    });

    messages.push(...data.data);
    cursor = data.next_cursor;
  } while (isNonEmptyString(cursor));

  return messages;
};
