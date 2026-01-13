import { useEffect, useRef } from 'react';

import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { IconRobot, IconX } from 'twenty-ui/display';

import { useAIChat } from '../hooks/useAIChat';
import { chatWidgetOpenState } from '../states/chatState';
import { AgentIndicator } from './AgentIndicator';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

const WidgetContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${({ isOpen }) => (isOpen ? '400px' : 'auto')};
  height: ${({ isOpen }) => (isOpen ? '600px' : 'auto')};
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.grayScale.gray0};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.grayScale.gray0};
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const EmptyStateText = styled.p`
  margin: ${({ theme }) => theme.spacing(2)} 0 0 0;
`;

const EmptyStateHint = styled.p`
  font-size: 0.85rem;
  margin: ${({ theme }) => theme.spacing(1)} 0 0 0;
`;

const FloatingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.grayScale.gray0};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  &:hover {
    background-color: ${({ theme }) => theme.color.blue50};
  }
`;

const MessagesEnd = styled.div`
  height: 1px;
`;

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useRecoilState(chatWidgetOpenState);
  const { messages, loading, activeAgent, sendMessage } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <WidgetContainer isOpen={false}>
        <FloatingButton onClick={() => setIsOpen(true)}>
          <IconRobot size={28} />
        </FloatingButton>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer isOpen={true}>
      <Header>
        <HeaderTitle>
          <IconRobot size={24} />
          AI Assistant
        </HeaderTitle>
        <CloseButton onClick={() => setIsOpen(false)}>
          <IconX size={20} />
        </CloseButton>
      </Header>

      <AgentIndicator agent={activeAgent} loading={loading} />

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <IconRobot size={48} />
            <EmptyStateText>How can I help you today?</EmptyStateText>
            <EmptyStateHint>
              Try asking about workflows, data, or company context
            </EmptyStateHint>
          </EmptyState>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <MessagesEnd ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </WidgetContainer>
  );
};
