import { TextArea } from '@/ui/input/components/TextArea';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { Avatar, IconDotsVertical, IconSparkles } from 'twenty-ui/display';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { formatChatMessageDate } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/formatChatMessageString';
import { Button } from 'twenty-ui/input';
import { useAgentChat } from '../hooks/useAgentChat';
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
  font-size: 15px;
  text-align: center;
  max-width: 410px;
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

const StyledMessageRow = styled.div`
  display: flex;
  flex-direction: row;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  &.message-footer {
    opacity: 0;
    pointer-events: none;
  }
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
  position: relative;
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

type AIChatTabProps = {
  agentId: string;
};

export const AIChatTab: React.FC<AIChatTabProps> = ({ agentId }) => {
  const theme = useTheme();

  const {
    messages,
    messagesLoading,
    sendingMessage,
    handleSendMessage,
    input,
    handleInputChange,
  } = useAgentChat(agentId);

  const isLoading = messagesLoading || sendingMessage;

  return (
    <StyledContainer>
      {messages.length !== 0 && (
        <StyledScrollWrapper componentInstanceId={agentId}>
          {messages.map((msg) => (
            <StyledMessageBubble key={msg.id} isUser={msg.sender === 'user'}>
              <StyledMessageRow>
                {msg.sender === 'ai' && (
                  <StyledAvatarContainer>
                    <Avatar
                      size="sm"
                      placeholder="AI"
                      Icon={IconSparkles}
                      iconColor={theme.color.blue}
                    />
                  </StyledAvatarContainer>
                )}
                {msg.sender === 'user' && (
                  <StyledAvatarContainer isUser>
                    <Avatar size="sm" placeholder="U" type="rounded" />
                  </StyledAvatarContainer>
                )}
                <StyledMessageContainer>
                  <StyledMessageText isUser={msg.sender === 'user'}>
                    {msg.sender === 'ai' && !msg.message ? (
                      <StyledDotsIconContainer>
                        <StyledDotsIcon size={theme.icon.size.xl} />
                      </StyledDotsIconContainer>
                    ) : (
                      msg.message
                    )}
                  </StyledMessageText>
                  <StyledMessageFooter className="message-footer">
                    <span>{formatChatMessageDate(msg.createdAt)}</span>
                    {msg.message && (
                      <LightCopyIconButton copyText={msg.message} />
                    )}
                  </StyledMessageFooter>
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
          <StyledTitle>Ask AI</StyledTitle>
          <StyledDescription>
            Start a conversation to get instant insights, support, or updates
            about your deals. How can I help you today?
          </StyledDescription>
        </StyledEmptyState>
      )}
      {isLoading && messages.length === 0 && <AIChatSkeletonLoader />}

      <StyledInputArea>
        <TextArea
          placeholder="Enter a question..."
          value={input}
          onChange={handleInputChange}
          disabled={sendingMessage}
        />
        <Button
          variant="primary"
          accent="blue"
          size="small"
          hotkeys={input && !sendingMessage ? ['⏎'] : undefined}
          disabled={!input || sendingMessage}
          title="Send"
          onClick={handleSendMessage}
        />
      </StyledInputArea>
    </StyledContainer>
  );
};
