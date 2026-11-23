import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import Linkify from 'linkify-react';

import { ChatThreadMessageReactions } from '@/activities/emails/components/ChatThreadMessageReactions';
import { ChatThreadMessageSenderHeader } from '@/activities/emails/components/ChatThreadMessageSenderHeader';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { ChatMessageAttachments } from '@/chat/components/ChatMessageAttachments';
import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';
import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { ChatMessageBubbleContent } from '@/chat/components/ChatMessageBubbleContent';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFloatingActions } from '@/chat/components/StyledChatMessageFloatingActions';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { CHAT_GROUPED_MESSAGE_GAP } from '@/chat/constants/ChatGroupedMessageGap';
import { CHAT_MESSAGE_LIST_GAP } from '@/chat/constants/ChatMessageListGap';
import { CHAT_RUN_GAP } from '@/chat/constants/ChatRunGap';
import { LightCopyIconButtonBase } from '@/ui/input/components/LightCopyIconButtonBase';
import {
  isDefined,
  isFieldValueRestricted,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { useIsTouchDevice } from 'twenty-ui/utilities';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledGroup = styled.div<{ isFollowedByRun: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${CHAT_GROUPED_MESSAGE_GAP};
  margin-bottom: ${({ isFollowedByRun }) =>
    isFollowedByRun ? `calc(${CHAT_RUN_GAP} - ${CHAT_MESSAGE_LIST_GAP})` : '0'};
`;

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
}: ChatThreadMessageGroupProps) => {
  const { t } = useLingui();
  const isTouchDevice = useIsTouchDevice();
  const [firstMessage] = group.messages;
  const { isOutgoing } = group;

  return (
    <StyledGroup isFollowedByRun={isFollowedByRun}>
      {group.messages.map((message, index) => {
        const headerSender =
          !isOutgoing && message.id === firstMessage.id
            ? message.sender
            : undefined;
        const senderHeader = isDefined(headerSender) && (
          <ChatThreadMessageSenderHeader sender={headerSender} />
        );
        const isGroupedWithPrevious = index > 0;
        const isGroupedWithNext = index < group.messages.length - 1;

        if (isFieldValueRestricted(message.text)) {
          return (
            <StyledMessageRow
              key={message.id}
              isRightAligned={isOutgoing}
              hasFooter={false}
            >
              {senderHeader}
              <EmailThreadNotShared
                visibility={MessageChannelVisibility.METADATA}
              />
            </StyledMessageRow>
          );
        }

        const files = (message.attachments ?? []).flatMap(
          (attachment) => attachment.file ?? [],
        );
        const hasText = isNonEmptyString(message.text);
        const reactions = reactionsByMessageId?.[message.id] ?? [];
        const hasReactions = isNonEmptyArray(reactions);
        const hasMeta = isOutgoing || isDefined(message.receivedAt);

        return (
          <StyledMessageRow
            key={message.id}
            isRightAligned={isOutgoing}
            isGroupedWithPrevious={isGroupedWithPrevious}
            isGroupedWithNext={isGroupedWithNext}
            hasFooter={hasReactions}
            data-hover-card={hasText ? '' : undefined}
            tabIndex={hasText && isTouchDevice ? -1 : undefined}
          >
            {senderHeader}
            {(hasText || !isNonEmptyArray(files)) && (
              <StyledChatMessageBubble isUser isOtherMember={!isOutgoing}>
                <ChatMessageBubbleContent
                  meta={
                    hasMeta ? (
                      <>
                        {isDefined(message.receivedAt) && (
                          <ChatMessageTime date={message.receivedAt} />
                        )}
                        {isOutgoing && <ChatMessageReceipt status="sent" />}
                      </>
                    ) : undefined
                  }
                >
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
              <ChatMessageAttachments
                files={files}
                isRightAligned={isOutgoing}
              />
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
              <StyledChatMessageFloatingActions
                className="message-actions"
                isAtStart={isOutgoing}
              >
                <ButtonGroup
                  aria-label={t`Message actions`}
                  framed
                  attached={false}
                >
                  <LightCopyIconButtonBase copyText={message.text} />
                </ButtonGroup>
              </StyledChatMessageFloatingActions>
            )}
          </StyledMessageRow>
        );
      })}
    </StyledGroup>
  );
};
