import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinSendMessageResult } from 'src/types/linkedin-send-message-result.type';
import { type UnipileOutgoingAttachment } from 'src/unipile/types/unipile-outgoing-attachment.type';
import { isUnipileUnsupportedMediaTypeError } from 'src/unipile/utils/is-unipile-unsupported-media-type-error.util';
import { sendUnipileChatMessage } from 'src/unipile/utils/send-unipile-chat-message.util';

// Unipile does not say which attachment LinkedIn refused, so each one goes in
// its own message and the refused ones are reported instead of sent.
export const sendLinkedinMessageInParts = async ({
  accountId,
  chatId,
  text,
  attachments,
}: {
  accountId: string;
  chatId: string;
  text: string;
  attachments: UnipileOutgoingAttachment[];
}): Promise<LinkedinSendMessageResult> => {
  let externalId = isNonEmptyString(text)
    ? await sendUnipileChatMessage({ accountId, chatId, text, attachments: [] })
    : undefined;
  const splitAttachments: NonNullable<
    LinkedinSendMessageResult['splitAttachments']
  > = [];
  const rejectedAttachmentIndexes: number[] = [];

  for (const [attachmentIndex, attachment] of attachments.entries()) {
    try {
      const attachmentExternalId = await sendUnipileChatMessage({
        accountId,
        chatId,
        text: '',
        attachments: [attachment],
      });

      if (isDefined(externalId)) {
        splitAttachments.push({
          attachmentIndex,
          externalId: attachmentExternalId,
        });
      } else {
        externalId = attachmentExternalId;
      }
    } catch (error) {
      // Once a part is sent, failing the reply would make a retry send it twice
      if (
        !isDefined(externalId) &&
        !isUnipileUnsupportedMediaTypeError(error)
      ) {
        throw error;
      }

      console.log(
        `[linkedin] attachment ${attachment.filename} not sent: ${error instanceof Error ? error.message : String(error)}`,
      );
      rejectedAttachmentIndexes.push(attachmentIndex);
    }
  }

  if (!isDefined(externalId)) {
    throw new Error('LinkedIn refused every attachment of the reply');
  }

  return { externalId, splitAttachments, rejectedAttachmentIndexes };
};
