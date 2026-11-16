import { styled } from '@linaria/react';
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
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageBubbleContent } from '@/chat/components/StyledChatMessageBubbleContent';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageMeta } from '@/chat/components/StyledChatMessageMeta';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { LightCopyIconButton } from '@/ui/input/components/LightCopyIconButton';
import {
  isDefined,
  isFieldValueRestricted,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
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
  reactionsByMessageId?: Record<string, ChatMessageReaction[]>;
  onReactionToggle?: (messageId: string, emoji: string) => void;
};

export const ChatThreadMessageGroup = ({
  group,
  reactionsByMessageId,
  onReactionToggle,
}: ChatThreadMessageGroupProps) => {
  const [firstMessage] = group.messages;
  const { isOutgoing } = group;

  return (
    <StyledGroup>
      {group.messages.map((message) => {
        const headerSender =
          !isOutgoing && message.id === firstMessage.id
            ? message.sender
            : undefined;
        const hasHeader = isDefined(headerSender);
        const senderHeader = hasHeader && (
          <ChatThreadMessageSenderHeader
            sender={headerSender}
            receivedAt={message.receivedAt}
          />
        );

        if (isFieldValueRestricted(message.text)) {
          return (
            <StyledChatMessageRow key={message.id} isRightAligned={isOutgoing}>
              {senderHeader}
              <EmailThreadNotShared
                visibility={MessageChannelVisibility.METADATA}
              />
            </StyledChatMessageRow>
          );
        }

        const files = (message.attachments ?? []).flatMap(
          (attachment) => attachment.file ?? [],
        );
        const hasText = isNonEmptyString(message.text);
        const reactions = reactionsByMessageId?.[message.id] ?? [];
        const hasReactions = isNonEmptyArray(reactions);

        return (
          <StyledChatMessageRow key={message.id} isRightAligned={isOutgoing}>
            {senderHeader}
            {(hasText || !isNonEmptyArray(files)) && (
              <StyledChatMessageBubble isUser isOtherMember={!isOutgoing}>
                <StyledChatMessageBubbleContent>
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
                  {isOutgoing && (
                    <StyledChatMessageMeta>
                      {isDefined(message.receivedAt) && (
                        <ChatMessageTime date={message.receivedAt} />
                      )}
                      <ChatMessageReceipt status="sent" />
                    </StyledChatMessageMeta>
                  )}
                </StyledChatMessageBubbleContent>
              </StyledChatMessageBubble>
            )}
            {isNonEmptyArray(files) && (
              <ChatMessageAttachments
                files={files}
                isRightAligned={isOutgoing}
              />
            )}
            {(hasText || hasReactions) && (
              <StyledChatMessageFooter isRightAligned={isOutgoing}>
                {hasReactions && (
                  <ChatThreadMessageReactions
                    reactions={reactions}
                    onReactionToggle={
                      isDefined(onReactionToggle)
                        ? (emoji) => onReactionToggle(message.id, emoji)
                        : undefined
                    }
                  />
                )}
                {hasText && (
                  <StyledChatMessageActions
                    className="message-actions"
                    isRightAligned={isOutgoing}
                  >
                    <LightCopyIconButton copyText={message.text} />
                  </StyledChatMessageActions>
                )}
              </StyledChatMessageFooter>
            )}
          </StyledChatMessageRow>
        );
      })}
    </StyledGroup>
  );
};
