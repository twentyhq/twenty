import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

const buildMultipartBody = ({
  text,
  attachments,
}: {
  text: string;
  attachments: UnipileOutgoingAttachment[];
}): FormData => {
  const formData = new FormData();

  formData.append('text', text);

  attachments.forEach(({ content, contentType, filename }, index) => {
    formData.append(
      `attachments[${index}]`,
      new Blob([new Uint8Array(content)], { type: contentType }),
      filename,
    );
  });

  return formData;
};

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
        body: { text },
        // Unipile rejects base64 attachments in a JSON body past ~1MB (413),
        // and the SDK only types that form. Dropping Content-Type lets fetch
        // set the multipart boundary.
        ...(isNonEmptyArray(attachments) && {
          bodySerializer: () => buildMultipartBody({ text, attachments }),
          headers: { 'Content-Type': null },
        }),
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
