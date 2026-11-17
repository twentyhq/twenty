import { isNonEmptyString } from '@sniptt/guards';
import { type SendAppMessageResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { isUnipileUnsupportedMediaTypeError } from 'src/unipile/utils/is-unipile-unsupported-media-type-error.util';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

// Unipile does not say which attachment LinkedIn refused, so each one goes in
// its own message and the ones that fail are left out of the reply.
export const sendLinkedinMessageInParts = async ({
  accountId,
  chatId,
  text,
  attachments,
  deadlineAtMs,
}: {
  accountId: string;
  chatId: string;
  text: string;
  attachments: UnipileOutgoingAttachment[];
  deadlineAtMs: number;
}): Promise<SendAppMessageResult> => {
  const chat = { accountId, chatId, deadlineAtMs };
  let sentMessage: SendAppMessageResult | undefined = isNonEmptyString(text)
    ? {
        externalId: await sendUnipileChatMessage({
          ...chat,
          text,
          attachments: [],
        }),
        sentAt: new Date().toISOString(),
      }
    : undefined;

  for (const attachment of attachments) {
    try {
      if (Date.now() >= deadlineAtMs) {
        throw new Error('No time left to send it');
      }

      const attachmentMessage = {
        externalId: await sendUnipileChatMessage({
          ...chat,
          text: '',
          attachments: [attachment],
        }),
        sentAt: new Date().toISOString(),
      };

      sentMessage ??= attachmentMessage;
    } catch (error) {
      // Once a part is sent, failing the reply would make a retry send it twice
      if (
        !isDefined(sentMessage) &&
        !isUnipileUnsupportedMediaTypeError(error)
      ) {
        throw error;
      }

      console.log(
        `[linkedin] attachment ${attachment.filename} not sent: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (!isDefined(sentMessage)) {
    throw new Error('LinkedIn refused every attachment of the reply');
  }

  return sentMessage;
};
