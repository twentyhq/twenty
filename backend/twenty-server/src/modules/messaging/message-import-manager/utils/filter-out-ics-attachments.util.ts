import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export const filterOutIcsAttachments = (
  messages: MessageWithParticipants[],
) => {
  return messages.filter((message) => {
    if (!message.attachments) {
      return true;
    }

    return message.attachments.every(
      (attachment) => !attachment.filename.endsWith('.ics'),
    );
  });
};
