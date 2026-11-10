import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import Linkify from 'linkify-react';

import { ChatThreadMessageAttachment } from '@/activities/emails/components/ChatThreadMessageAttachment';
import { ChatThreadMessageSenderHeader } from '@/activities/emails/components/ChatThreadMessageSenderHeader';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type ChatMessageGroup } from '@/activities/emails/types/ChatMessageGroup';
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
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

const StyledFilesContainer = styled.div<{ isOutgoing: boolean }>`
  align-items: ${({ isOutgoing }) => (isOutgoing ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:first-child {
    margin-top: 0;
  }
`;

type ChatThreadMessageGroupProps = {
  group: ChatMessageGroup;
};

export const ChatThreadMessageGroup = ({
  group,
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

        return (
          <StyledChatMessageRow key={message.id} isRightAligned={isOutgoing}>
            {senderHeader}
            {(hasText || !isNonEmptyArray(files)) && (
              <StyledChatMessageBubble isUser isOtherMember={!isOutgoing}>
                <StyledMessageText>
                  <Linkify
                    options={{ target: '_blank', rel: 'noopener noreferrer' }}
                  >
                    {message.text}
                  </Linkify>
                </StyledMessageText>
              </StyledChatMessageBubble>
            )}
            {isNonEmptyArray(files) && (
              <StyledFilesContainer isOutgoing={isOutgoing}>
                {files.map((file) => (
                  <ChatThreadMessageAttachment key={file.fileId} file={file} />
                ))}
              </StyledFilesContainer>
            )}
            {hasText && (
              <StyledChatMessageFooter isRightAligned={isOutgoing}>
                <StyledChatMessageActions
                  className="message-actions"
                  isRightAligned={isOutgoing}
                >
                  <LightCopyIconButton copyText={message.text} />
                </StyledChatMessageActions>
              </StyledChatMessageFooter>
            )}
          </StyledChatMessageRow>
        );
      })}
    </StyledGroup>
  );
};
