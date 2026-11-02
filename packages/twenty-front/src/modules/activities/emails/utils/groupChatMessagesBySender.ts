import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { isDefined } from 'twenty-shared/utils';

export const groupChatMessagesBySender = (
  messages: EmailThreadMessageWithSender[],
  outgoingMessageIds: ReadonlySet<string>,
): ChatMessageGroup[] =>
  messages.reduce<ChatMessageGroup[]>((groups, message) => {
    const isOutgoing = outgoingMessageIds.has(message.id);
    const lastGroup = groups.at(-1);
    const lastSenderHandle = lastGroup?.messages.at(-1)?.sender?.handle;

    if (
      lastGroup?.isOutgoing === isOutgoing &&
      isDefined(message.sender?.handle) &&
      lastSenderHandle === message.sender.handle
    ) {
      lastGroup.messages.push(message);

      return groups;
    }

    return [...groups, { id: message.id, isOutgoing, messages: [message] }];
  }, []);
