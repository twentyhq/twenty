import { useState } from 'react';
import { type EmailAttachment } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSendAppChannelMessage } from '@/activities/emails/hooks/useSendAppChannelMessage';
import { useUploadEmailAttachment } from '@/activities/emails/hooks/useUploadEmailAttachment';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';

type SendPendingChatMessageArgs = {
  messageChannelId: string;
  messageThreadId: string;
  pendingMessage: PendingChatMessage;
};

export const useSendPendingChatMessage = () => {
  const { sendAppChannelMessage } = useSendAppChannelMessage();
  const { uploadEmailAttachment } = useUploadEmailAttachment();
  // a retry reuses the uploads of its first attempt instead of uploading the files again
  const [
    uploadedAttachmentsByPendingMessageId,
    setUploadedAttachmentsByPendingMessageId,
  ] = useState<Record<string, EmailAttachment[]>>({});

  const uploadAttachmentsOrThrow = async ({
    id,
    files,
  }: PendingChatMessage): Promise<EmailAttachment[]> => {
    const uploadedAttachments = uploadedAttachmentsByPendingMessageId[id];

    if (isDefined(uploadedAttachments)) {
      return uploadedAttachments;
    }

    const attachments = await Promise.all(files.map(uploadEmailAttachment));

    // the upload already toasted the failure; throwing marks the message as failed
    if (!attachments.every(isDefined)) {
      throw new Error('Some attachments failed to upload');
    }

    setUploadedAttachmentsByPendingMessageId((currentAttachments) => ({
      ...currentAttachments,
      [id]: attachments,
    }));

    return attachments;
  };

  const sendPendingChatMessage = async ({
    messageChannelId,
    messageThreadId,
    pendingMessage,
  }: SendPendingChatMessageArgs) => {
    const attachments = await uploadAttachmentsOrThrow(pendingMessage);

    const sentMessage = await sendAppChannelMessage({
      messageChannelId,
      messageThreadId,
      text: pendingMessage.text,
      attachments,
      idempotencyKey: pendingMessage.id,
    });

    setUploadedAttachmentsByPendingMessageId(
      ({ [pendingMessage.id]: _sentAttachments, ...currentAttachments }) =>
        currentAttachments,
    );

    return sentMessage;
  };

  return { sendPendingChatMessage };
};
