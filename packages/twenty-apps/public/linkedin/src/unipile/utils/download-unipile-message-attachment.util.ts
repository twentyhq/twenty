import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const downloadUnipileMessageAttachment = async ({
  accountId,
  chatId,
  messageId,
  attachmentId,
}: {
  accountId: string;
  chatId: string;
  messageId: string;
  attachmentId: string;
}): Promise<Buffer> => {
  const { data } = await requestUnipile('download message attachment', () =>
    new UnipileMessaging().getAttachment({
      ...getUnipileRequestOptions(),
      parseAs: 'arrayBuffer',
      path: {
        account_id: accountId,
        chat_id: chatId,
        message_id: messageId,
        attachment_id: attachmentId,
      },
    }),
  );

  return Buffer.from(data as ArrayBuffer);
};
