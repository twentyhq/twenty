import axios from 'axios';
import { uploadMessageAttachment } from 'twenty-sdk/logic-function';
import { isNonEmptyString } from '@sniptt/guards';

import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';
import { type MessengerWebhookMessage } from 'src/logic-functions/types/messenger-webhook.type';

export const uploadIncomingAttachments = async (
  message: MessengerWebhookMessage,
) => {
  const uploadedAttachments: { fileId: string; label: string }[] = [];

  for (const [index, attachment] of (message.attachments ?? []).entries()) {
    const url = attachment.payload?.url;

    if (!isNonEmptyString(url)) {
      continue;
    }

    const { data } = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });

    uploadedAttachments.push(
      await uploadMessageAttachment({
        filename: buildIncomingAttachmentFilename({
          url,
          attachmentType: attachment.type,
          messageId: message.mid,
          index,
        }),
        content: new Uint8Array(data),
      }),
    );
  }

  return uploadedAttachments;
};
