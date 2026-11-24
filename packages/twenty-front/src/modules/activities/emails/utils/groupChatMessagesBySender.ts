import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getChatMessageDayKey } from '@/chat/utils/getChatMessageDayKey';
import { getIsFirstChatMessageOfDayByIndex } from '@/chat/utils/getIsFirstChatMessageOfDayByIndex';
import { isDefined } from 'twenty-shared/utils';

export const groupChatMessagesBySender = ({
  messages,
  outgoingMessageIds,
  timeZone,
}: {
  messages: EmailThreadMessageWithSender[];
  outgoingMessageIds: ReadonlySet<string>;
  timeZone: string;
}): ChatMessageGroup[] => {
  const isFirstOfDayByIndex = getIsFirstChatMessageOfDayByIndex(
    messages.map((message) =>
      getChatMessageDayKey({
        createdAt: message.receivedAt ?? undefined,
        timeZone,
      }),
    ),
  );
  const groups: ChatMessageGroup[] = [];

  for (const [index, message] of messages.entries()) {
    const isOutgoing = outgoingMessageIds.has(message.id);
    const isFirstOfDay = isFirstOfDayByIndex[index];
    const lastGroup = groups.at(-1);
    const lastSenderHandle = lastGroup?.messages.at(-1)?.sender?.handle;

    if (
      lastGroup?.isOutgoing === isOutgoing &&
      !isFirstOfDay &&
      isDefined(message.sender?.handle) &&
      lastSenderHandle === message.sender.handle
    ) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        id: message.id,
        isOutgoing,
        isFirstOfDay,
        messages: [message],
      });
    }
  }

  return groups;
};
