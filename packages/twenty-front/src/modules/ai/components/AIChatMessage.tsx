import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar, IconDotsVertical, IconSparkles } from 'twenty-ui/display';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AgentChatMessageRole } from '@/ai/constants/agent-chat-message-role';
import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';

import { AgentChatMessage } from '~/generated/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  width: 100%;

  &:hover .message-footer {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledMessageRow = styled.div<{ isShowingToolCall?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: ${({ isShowingToolCall }) =>
    isShowingToolCall ? 'center' : 'flex-start'};
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledMessageText = styled.div<{ isUser?: boolean }>`
  background: ${({ theme, isUser }) =>
    isUser ? theme.background.secondary : theme.background.transparent};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme, isUser }) => (isUser ? theme.spacing(1, 2) : 0)};
  border: ${({ isUser, theme }) =>
    !isUser ? 'none' : `1px solid ${theme.border.color.light}`};
  color: ${({ theme, isUser }) =>
    isUser ? theme.font.color.light : theme.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  width: fit-content;
  white-space: pre-line;
`;

const StyledMessageFooter = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(1)};
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  width: 100%;
`;

const StyledAvatarContainer = styled.div<{ isUser?: boolean }>`
  align-items: center;
  background: ${({ theme, isUser }) =>
    isUser
      ? theme.background.transparent.light
      : theme.background.transparent.blue};
  display: flex;
  justify-content: center;
  height: 24px;
  min-width: 24px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 1px;
`;

const StyledMessageContainer = styled.div`
  width: 100%;
`;

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const dots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

const StyledToolCallContainer = styled.div`
  &::after {
    display: inline-block;
    content: '';
    animation: ${dots} 750ms steps(3, end) infinite;
    width: 2ch;
    text-align: left;
  }
`;

const StyledDotsIconContainer = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
`;

const StyledDotsIcon = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.light};
  transform: rotate(90deg);
`;

export const AIChatMessage = ({
  message,
  agentStreamingMessage,
}: {
  message: AgentChatMessage;
  agentStreamingMessage: { streamingText: string; toolCall: string };
}) => {
  const theme = useTheme();

  const markdownRender = (text: string) => {
    return <LazyMarkdownRenderer text={text} />;
  };

  const getAssistantMessageContent = (message: AgentChatMessage) => {
    if (message.content !== '') {
      return markdownRender(message.content);
    }

    if (agentStreamingMessage.streamingText !== '') {
      return markdownRender(agentStreamingMessage.streamingText);
    }

    if (agentStreamingMessage.toolCall !== '') {
      return (
        <StyledToolCallContainer>
          {agentStreamingMessage.toolCall}
        </StyledToolCallContainer>
      );
    }

    return (
      <StyledDotsIconContainer>
        <StyledDotsIcon size={theme.icon.size.xl} />
      </StyledDotsIconContainer>
    );
  };

  return (
    <StyledMessageBubble
      key={message.id}
      isUser={message.role === AgentChatMessageRole.USER}
    >
      <StyledMessageRow
        isShowingToolCall={
          message.role === AgentChatMessageRole.ASSISTANT &&
          message.content === '' &&
          agentStreamingMessage.streamingText === '' &&
          agentStreamingMessage.toolCall !== ''
        }
      >
        {message.role === AgentChatMessageRole.ASSISTANT && (
          <StyledAvatarContainer>
            <Avatar
              size="sm"
              placeholder="AI"
              Icon={IconSparkles}
              iconColor={theme.color.blue}
            />
          </StyledAvatarContainer>
        )}
        {message.role === AgentChatMessageRole.USER && (
          <StyledAvatarContainer isUser>
            <Avatar size="sm" placeholder="U" type="rounded" />
          </StyledAvatarContainer>
        )}
        <StyledMessageContainer>
          <StyledMessageText
            isUser={message.role === AgentChatMessageRole.USER}
          >
            {message.role === AgentChatMessageRole.ASSISTANT
              ? getAssistantMessageContent(message)
              : message.content}
          </StyledMessageText>
          {message.files.length > 0 && (
            <StyledFilesContainer>
              {message.files.map((file) => (
                <AgentChatFilePreview key={file.id} file={file} />
              ))}
            </StyledFilesContainer>
          )}
          {message.content && (
            <StyledMessageFooter className="message-footer">
              <span>{beautifyPastDateRelativeToNow(message.createdAt)}</span>
              <LightCopyIconButton copyText={message.content} />
            </StyledMessageFooter>
          )}
        </StyledMessageContainer>
      </StyledMessageRow>
    </StyledMessageBubble>
  );
};
