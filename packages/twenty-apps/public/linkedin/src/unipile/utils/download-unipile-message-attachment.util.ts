import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

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

  // Streamed so a file Unipile listed without a size is stopped at the limit instead of buffered whole
  const reader = (data as ReadableStream<Uint8Array>).getReader();
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      return Buffer.concat(chunks);
    }

    sizeBytes += value.byteLength;

    if (sizeBytes > maxSizeBytes) {
      await reader.cancel();

      throw new Error(`Attachment is larger than ${maxSizeBytes} bytes`);
    }

    chunks.push(value);
  }
};
