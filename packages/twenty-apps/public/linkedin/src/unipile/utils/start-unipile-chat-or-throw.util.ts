import { isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const startUnipileChatOrThrow = async ({
  accountId,
  userId,
  text,
}: {
  accountId: string;
  userId: string;
  text: string;
}): Promise<{ chatId: string; messageId: string }> => {
  const { data } = await requestUnipile(
    'start chat',
    () =>
      new UnipileMessaging().startChat({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId },
        body: { text, users_ids: userId },
      }),
    { deadlineAtMs: Date.now() },
  );

  const [messageId] = [data.message_id].flat();

  if (!isNonEmptyString(data.chat_id) || !isNonEmptyString(messageId)) {
    throw new Error(
      `Unipile started a chat with user ${userId} but returned no chat or message id`,
    );
  }

  return { chatId: data.chat_id, messageId };
};
