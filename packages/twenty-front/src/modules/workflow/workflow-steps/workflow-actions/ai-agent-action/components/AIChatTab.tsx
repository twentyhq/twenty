import { TextArea } from '@/ui/input/components/TextArea';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Avatar, IconSparkles } from 'twenty-ui/display';

import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledMessageList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  overflow-y: auto;
`;

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledMessageText = styled.div<{ isUser?: boolean }>`
  background: ${({ theme, isUser }) =>
    isUser ? theme.background.secondary : theme.background.transparent};
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme, isUser }) => (isUser ? theme.spacing(1, 2) : 0)};
  border: ${({ isUser, theme }) =>
    !isUser ? 'none' : `1px solid ${theme.border.color.light}`};
  color: ${({ theme, isUser }) =>
    isUser ? theme.font.color.light : theme.font.color.primary};
  max-width: 320px;
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
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
  width: 24px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 1px;
  position: relative;
`;

export const AIChatTab: React.FC = () => {
  const [input, setInput] = useState('');
    const messages = [
      {
        id: 1,
        sender: 'ai',
        text: 'Hello! How can I help you today?',
      },
      {
        id: 2,
        sender: 'user',
        text: 'Can you give me an update on my deals?',
      },
    ];

  const theme = useTheme();

  return (
    <StyledContainer>
      {messages.length !== 0 && (
        <StyledMessageList>
          {messages.map((msg) => (
            <StyledMessageBubble key={msg.id} isUser={msg.sender === 'user'}>
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
              <StyledMessageText isUser={msg.sender === 'user'}>
                {msg.text}
              </StyledMessageText>
            </StyledMessageBubble>
          ))}
        </StyledMessageList>
      )}
      {messages.length === 0 && (
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
      <StyledInputArea>
        <TextArea
          placeholder="Enter a question..."
          value={input}
          onChange={(value) => setInput(value)}
        />
        <Button
          variant="primary"
          accent="blue"
          size="small"
          hotkeys={input ? ['⏎'] : undefined}
          disabled={!input}
          title="Send"
        />
      </StyledInputArea>
    </StyledContainer>
  );
};
