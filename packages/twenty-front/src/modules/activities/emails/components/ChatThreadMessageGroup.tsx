import { styled } from '@linaria/react';

import { ChatThreadMessage } from '@/activities/emails/components/ChatThreadMessage';
import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { CHAT_GROUPED_MESSAGE_GAP } from '@/chat/constants/ChatGroupedMessageGap';
import { CHAT_MESSAGE_LIST_GAP } from '@/chat/constants/ChatMessageListGap';
import { CHAT_RUN_GAP } from '@/chat/constants/ChatRunGap';
import { isChatMessageTimeSharedWithNext } from '@/chat/utils/isChatMessageTimeSharedWithNext';

const StyledGroup = styled.div<{ isFollowedByRun: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${CHAT_GROUPED_MESSAGE_GAP};
  margin-bottom: ${({ isFollowedByRun }) =>
    isFollowedByRun ? `calc(${CHAT_RUN_GAP} - ${CHAT_MESSAGE_LIST_GAP})` : '0'};
`;

type ChatThreadMessageGroupProps = {
  group: ChatMessageGroup;
  isFollowedByRun?: boolean;
  reactionsByMessageId?: Record<string, ChatMessageReaction[]>;
  onReactionToggle?: (messageId: string, emoji: string) => void;
};

export const ChatThreadMessageGroup = ({
  group,
  isFollowedByRun = false,
  reactionsByMessageId,
  onReactionToggle,
}: ChatThreadMessageGroupProps) => (
  <StyledGroup isFollowedByRun={isFollowedByRun}>
    {group.messages.map((message, index) => (
      <ChatThreadMessage
        key={message.id}
        message={message}
        isOutgoing={group.isOutgoing}
        hasSenderHeader={!group.isOutgoing && index === 0}
        isGroupedWithPrevious={index > 0}
        isGroupedWithNext={index < group.messages.length - 1}
        isTimeSharedWithNext={isChatMessageTimeSharedWithNext({
          sentAt: message.receivedAt,
          nextSentAt: group.messages[index + 1]?.receivedAt,
        })}
        reactions={reactionsByMessageId?.[message.id] ?? []}
        onReactionToggle={onReactionToggle}
      />
    ))}
  </StyledGroup>
);
