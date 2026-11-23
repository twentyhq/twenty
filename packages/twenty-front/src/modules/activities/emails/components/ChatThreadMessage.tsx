import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import Linkify from 'linkify-react';

import { ChatThreadMessageReactions } from '@/activities/emails/components/ChatThreadMessageReactions';
import { ChatThreadMessageSenderHeader } from '@/activities/emails/components/ChatThreadMessageSenderHeader';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { ChatMessageAttachments } from '@/chat/components/ChatMessageAttachments';
import { ChatMessageBubbleContent } from '@/chat/components/ChatMessageBubbleContent';
import { ChatMessageCopyAction } from '@/chat/components/ChatMessageCopyAction';
import { ChatMessageFloatingActions } from '@/chat/components/ChatMessageFloatingActions';
import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';
import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { StyledChatMessageStandaloneMeta } from '@/chat/components/StyledChatMessageStandaloneMeta';
import { CHAT_GROUPED_MESSAGE_GAP } from '@/chat/constants/ChatGroupedMessageGap';
import { CHAT_MESSAGE_LIST_GAP } from '@/chat/constants/ChatMessageListGap';
import {
  isDefined,
  isFieldValueRestricted,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { useIsTouchDevice } from 'twenty-ui/utilities';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledMessageRow = styled(StyledChatMessageRow)<{ hasFooter: boolean }>`
  &:not(:last-child) {
    margin-bottom: ${({ hasFooter }) =>
      hasFooter
        ? `calc(${CHAT_MESSAGE_LIST_GAP} - ${CHAT_GROUPED_MESSAGE_GAP})`
        : '0'};
  }
`;

const StyledMessageText = styled.span`
  white-space: pre-line;

  a {
    color: inherit;
    text-decoration: underline;
  }
`;

type ChatThreadMessageProps = {
  message: EmailThreadMessageWithSender;
  isOutgoing: boolean;
  hasSenderHeader: boolean;
  isGroupedWithPrevious: boolean;
  isGroupedWithNext: boolean;
  isTimeSharedWithNext: boolean;
  reactions: ChatMessageReaction[];
  onReactionToggle?: (messageId: string, emoji: string) => void;
};

export const ChatThreadMessage = ({
  message,
  isOutgoing,
  hasSenderHeader,
  isGroupedWithPrevious,
  isGroupedWithNext,
  isTimeSharedWithNext,
  reactions,
  onReactionToggle,
}: ChatThreadMessageProps) => {
  const senderHeader = hasSenderHeader && isDefined(message.sender) && (
    <ChatThreadMessageSenderHeader sender={message.sender} />
  );
  const isTouchDevice = useIsTouchDevice();
  const hasMeta =
    !isTimeSharedWithNext && (isOutgoing || isDefined(message.receivedAt));
  const meta = hasMeta ? (
    <>
      {isDefined(message.receivedAt) && (
        <ChatMessageTime date={message.receivedAt} />
      )}
      {isOutgoing && <ChatMessageReceipt status="sent" />}
    </>
  ) : undefined;

  if (isFieldValueRestricted(message.text)) {
    return (
      <StyledMessageRow isRightAligned={isOutgoing} hasFooter={hasMeta}>
        {senderHeader}
        <EmailThreadNotShared visibility={MessageChannelVisibility.METADATA} />
        {hasMeta && (
          <StyledChatMessageStandaloneMeta isRightAligned={isOutgoing}>
            {meta}
          </StyledChatMessageStandaloneMeta>
        )}
      </StyledMessageRow>
    );
  }

  const files = (message.attachments ?? []).flatMap(
    (attachment) => attachment.file ?? [],
  );
  const hasText = isNonEmptyString(message.text);
  const hasReactions = isNonEmptyArray(reactions);
  const hasBubble = hasText || !isNonEmptyArray(files);

  return (
    <StyledMessageRow
      isRightAligned={isOutgoing}
      isGroupedWithPrevious={isGroupedWithPrevious}
      isGroupedWithNext={isGroupedWithNext}
      hasFooter={hasReactions || (!hasBubble && hasMeta)}
      data-hover-card={hasText ? '' : undefined}
      tabIndex={hasText && isTouchDevice ? -1 : undefined}
    >
      {senderHeader}
      {hasBubble && (
        <StyledChatMessageBubble isUser isOtherMember={!isOutgoing}>
          <ChatMessageBubbleContent meta={meta}>
            <StyledMessageText>
              <Linkify
                options={{
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {message.text}
              </Linkify>
            </StyledMessageText>
          </ChatMessageBubbleContent>
        </StyledChatMessageBubble>
      )}
      {isNonEmptyArray(files) && (
        <ChatMessageAttachments files={files} isRightAligned={isOutgoing} />
      )}
      {!hasBubble && hasMeta && (
        <StyledChatMessageStandaloneMeta isRightAligned={isOutgoing}>
          {meta}
        </StyledChatMessageStandaloneMeta>
      )}
      {hasReactions && (
        <StyledChatMessageFooter isCompact isRightAligned={isOutgoing}>
          <ChatThreadMessageReactions
            reactions={reactions}
            onReactionToggle={
              isDefined(onReactionToggle)
                ? (emoji) => onReactionToggle(message.id, emoji)
                : undefined
            }
          />
        </StyledChatMessageFooter>
      )}
      {hasText && (
        <ChatMessageFloatingActions isRightAligned={isOutgoing}>
          <ChatMessageCopyAction text={message.text} />
        </ChatMessageFloatingActions>
      )}
    </StyledMessageRow>
  );
};
