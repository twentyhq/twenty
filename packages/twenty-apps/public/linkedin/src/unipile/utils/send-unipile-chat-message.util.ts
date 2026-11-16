import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const sendUnipileChatMessage = async ({
  accountId,
  chatId,
  text,
  attachments,
}: {
  accountId: string;
  chatId: string;
  text: string;
  attachments: UnipileOutgoingAttachment[];
}): Promise<string> => {
  const { data } = await requestUnipile(
    'send message',
    () =>
      new UnipileMessaging().sendMessage({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId, chat_id: chatId },
        body: isNonEmptyArray(attachments) ? { text, attachments } : { text },
      }),
    { deadlineAtMs: Date.now() },
  );

  const [messageId] = [data.message_id].flat();

  if (!isNonEmptyString(messageId)) {
    throw new Error(
      `Unipile accepted the message to chat ${chatId} but returned no message id`,
    );
  }

  return messageId;
};
