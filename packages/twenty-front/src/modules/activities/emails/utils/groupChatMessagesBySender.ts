import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { isDefined } from 'twenty-shared/utils';

export const groupChatMessagesBySender = (
  messages: EmailThreadMessageWithSender[],
  outgoingMessageIds: ReadonlySet<string>,
): ChatMessageGroup[] => {
  const groups: ChatMessageGroup[] = [];

  for (const message of messages) {
    const isOutgoing = outgoingMessageIds.has(message.id);
    const lastGroup = groups.at(-1);
    const lastSenderHandle = lastGroup?.messages.at(-1)?.sender?.handle;

    if (
      lastGroup?.isOutgoing === isOutgoing &&
      isDefined(message.sender?.handle) &&
      lastSenderHandle === message.sender.handle
    ) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ id: message.id, isOutgoing, messages: [message] });
    }
  }

  return groups;
};
