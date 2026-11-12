import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { readStreamWithinSizeLimit } from 'src/utils/read-stream-within-size-limit.util';

export const downloadUnipileMessageAttachment = async ({
  accountId,
  chatId,
  messageId,
  attachmentId,
  maxSizeBytes,
  deadlineAtMs,
}: {
  accountId: string;
  chatId: string;
  messageId: string;
  attachmentId: string;
  maxSizeBytes: number;
  deadlineAtMs: number;
}): Promise<Buffer> => {
  const signal = AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1));
  const { data } = await requestUnipile(
    'download message attachment',
    () =>
      new UnipileMessaging().getAttachment({
        ...getUnipileRequestOptions(),
        parseAs: 'stream',
        signal,
        path: {
          account_id: accountId,
          chat_id: chatId,
          message_id: messageId,
          attachment_id: attachmentId,
        },
      }),
    { deadlineAtMs },
  );

  if (!(data instanceof ReadableStream)) {
    throw new Error('Unipile returned no attachment content');
  }

  return readStreamWithinSizeLimit({ stream: data, maxSizeBytes });
};
