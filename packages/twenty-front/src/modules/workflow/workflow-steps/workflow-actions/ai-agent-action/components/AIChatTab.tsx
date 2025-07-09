import { TextArea } from '@/ui/input/components/TextArea';
import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { Avatar, IconDotsVertical, IconSparkles } from 'twenty-ui/display';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/input';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { useAgentChat } from '../hooks/useAgentChat';
import { AgentChatMessage } from '../hooks/useAgentChatMessages';
import { AIChatSkeletonLoader } from './AIChatSkeletonLoader';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  height: calc(100% - 154px);
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledSparkleIcon = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 40px;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 40px;
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: 600;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  max-width: 85%;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledInputArea = styled.div`
  align-items: flex-end;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  width: calc(100% - 24px);
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.primary};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  width: calc(100% - 24px);
`;

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

const StyledMessageContainer = styled.div`
  width: 100%;
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

type AIChatTabProps = {
  agentId: string;
};

export const AIChatTab: React.FC<AIChatTabProps> = ({ agentId }) => {
  const theme = useTheme();

  const {
    messages,
    isLoading,
    handleSendMessage,
    input,
    handleInputChange,
    agentStreamingMessage,
  } = useAgentChat(agentId);

  const getAssistantMessageContent = (message: AgentChatMessage) => {
    if (message.content !== '') {
      return message.content;
    }

    if (agentStreamingMessage.streamingText !== '') {
      return agentStreamingMessage.streamingText;
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
    <StyledContainer>
      {messages.length !== 0 && (
        <StyledScrollWrapper
          componentInstanceId={`scroll-wrapper-ai-chat-${agentId}`}
        >
          {messages.map((msg) => (
            <StyledMessageBubble
              key={msg.id}
              isUser={msg.role === AgentChatMessageRole.USER}
            >
              <StyledMessageRow
                isShowingToolCall={
                  msg.role === AgentChatMessageRole.ASSISTANT &&
                  msg.content === '' &&
                  agentStreamingMessage.streamingText === '' &&
                  agentStreamingMessage.toolCall !== ''
                }
              >
                {msg.role === AgentChatMessageRole.ASSISTANT && (
                  <StyledAvatarContainer>
                    <Avatar
                      size="sm"
                      placeholder="AI"
                      Icon={IconSparkles}
                      iconColor={theme.color.blue}
                    />
                  </StyledAvatarContainer>
                )}
                {msg.role === AgentChatMessageRole.USER && (
                  <StyledAvatarContainer isUser>
                    <Avatar size="sm" placeholder="U" type="rounded" />
                  </StyledAvatarContainer>
                )}
                <StyledMessageContainer>
                  <StyledMessageText
                    isUser={msg.role === AgentChatMessageRole.USER}
                  >
                    {msg.role === AgentChatMessageRole.ASSISTANT
                      ? getAssistantMessageContent(msg)
                      : msg.content}
                  </StyledMessageText>
                  {msg.content && (
                    <StyledMessageFooter className="message-footer">
                      <span>
                        {beautifyPastDateRelativeToNow(msg.createdAt)}
                      </span>
                      <LightCopyIconButton copyText={msg.content} />
                    </StyledMessageFooter>
                  )}
                </StyledMessageContainer>
              </StyledMessageRow>
            </StyledMessageBubble>
          ))}
        </StyledScrollWrapper>
      )}
      {messages.length === 0 && !isLoading && (
        <StyledEmptyState>
          <StyledSparkleIcon>
            <IconSparkles size={theme.icon.size.lg} color={theme.color.blue} />
          </StyledSparkleIcon>
          <StyledTitle>{t`Chat`}</StyledTitle>
          <StyledDescription>
            {t`Start a conversation with your AI agent to get workflow insights, task assistance, and process guidance`}
          </StyledDescription>
        </StyledEmptyState>
      )}
      {isLoading && messages.length === 0 && <AIChatSkeletonLoader />}

      <StyledInputArea>
        <TextArea
          textAreaId={`${agentId}-chat-input`}
          placeholder={t`Enter a question...`}
          value={input}
          onChange={handleInputChange}
        />
        <Button
          variant="primary"
          accent="blue"
          size="small"
          hotkeys={input && !isLoading ? ['⏎'] : undefined}
          disabled={!input || isLoading}
          title={t`Send`}
          onClick={handleSendMessage}
        />
      </StyledInputArea>
    </StyledContainer>
  );
};
