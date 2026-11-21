import { type SendAppMessageAttachment } from 'twenty-sdk/logic-function';

import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { type MessengerOutgoingAttachmentType } from 'src/logic-functions/types/messenger-outgoing-attachment-type.type';
import { type ReplyMessagingType } from 'src/logic-functions/types/reply-messaging-type.type';

// uploaded as file data because the Twenty download URL may not be reachable from Meta
export const sendMessengerAttachment = async ({
  pageAccessToken,
  pageId,
  recipientId,
  attachment,
  attachmentType,
  replyMessagingType,
}: {
  pageAccessToken: string;
  pageId: string;
  recipientId: string;
  attachment: SendAppMessageAttachment;
  attachmentType: MessengerOutgoingAttachmentType;
  replyMessagingType: ReplyMessagingType;
}): Promise<string> => {
  const response = await fetch(attachment.downloadUrl);

  if (!response.ok) {
    throw new Error(
      `Downloading attachment ${attachment.filename} failed (${response.status})`,
    );
  }

  const formData = new FormData();

  formData.append('recipient', JSON.stringify({ id: recipientId }));
  for (const [key, value] of Object.entries(replyMessagingType)) {
    formData.append(key, value);
  }
  formData.append(
    'message',
    JSON.stringify({ attachment: { type: attachmentType, payload: {} } }),
  );
  formData.append(
    'filedata',
    new Blob([await response.arrayBuffer()], {
      type: attachment.contentType,
    }),
    attachment.filename,
  );

  const { message_id } = await graphApiRequest<{ message_id: string }>({
    accessToken: pageAccessToken,
    method: 'POST',
    path: `${pageId}/messages`,
    data: formData,
  });

  return message_id;
};
