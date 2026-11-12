import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
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
  // a retry reuses the uploads that succeeded and only uploads the failed files again
  const [uploadsByPendingMessageId, setUploadsByPendingMessageId] = useState<
    Record<string, (EmailAttachment | null)[]>
  >({});

  const uploadAttachmentsOrThrow = async ({
    id,
    files,
  }: Pick<PendingChatMessage, 'id' | 'files'>): Promise<EmailAttachment[]> => {
    const previousUploads = uploadsByPendingMessageId[id] ?? [];

    const uploads = await Promise.all(
      files.map(
        (file, index) => previousUploads[index] ?? uploadEmailAttachment(file),
      ),
    );

    setUploadsByPendingMessageId((currentUploads) => ({
      ...currentUploads,
      [id]: uploads,
    }));

    const attachments = uploads.filter(isDefined);

    // the upload already toasted the failure; throwing marks the message as failed
    if (attachments.length < files.length) {
      throw new Error(doNotTranslate('Some attachments failed to upload'));
    }

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

    setUploadsByPendingMessageId(
      ({ [pendingMessage.id]: _sentUploads, ...currentUploads }) =>
        currentUploads,
    );

    return sentMessage;
  };

  return { sendPendingChatMessage };
};
