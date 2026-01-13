import styled from '@emotion/styled';

import { AGENT_CONFIGS } from '../constants/agents';
import { ChatMessage as ChatMessageType } from '../types/chat.types';

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const MessageBubble = styled.div<{ isUser: boolean; isSystem: boolean }>`
  max-width: 80%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  background-color: ${({ isUser, isSystem, theme }) =>
    isSystem
      ? theme.background.transparent.light
      : isUser
        ? theme.color.blue
        : theme.background.secondary};
  color: ${({ isUser, isSystem, theme }) =>
    isSystem
      ? theme.font.color.tertiary
      : isUser
        ? theme.grayScale.gray0
        : theme.font.color.primary};
  font-size: ${({ isSystem }) => (isSystem ? '0.85rem' : '1rem')};
  font-style: ${({ isSystem }) => (isSystem ? 'italic' : 'normal')};
`;

const AgentLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.font.color.light};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type ChatMessageProps = {
  message: ChatMessageType;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const agentConfig = message.agent ? AGENT_CONFIGS[message.agent] : null;

  return (
    <MessageContainer isUser={isUser}>
      {agentConfig && !isUser && <AgentLabel>{agentConfig.name}</AgentLabel>}
      <MessageBubble isUser={isUser} isSystem={isSystem}>
        {message.content}
      </MessageBubble>
      <Timestamp>
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Timestamp>
    </MessageContainer>
  );
};
