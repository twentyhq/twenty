import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const markUnipileChatAsRead = async ({
  accountId,
  chatId,
}: {
  accountId: string;
  chatId: string;
}): Promise<void> => {
  await requestUnipile(
    'mark chat as read',
    () =>
      new UnipileMessaging().updateChat({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId, chat_id: chatId },
        body: { read_status: true },
      }),
    { deadlineAtMs: Date.now() },
  );
};
