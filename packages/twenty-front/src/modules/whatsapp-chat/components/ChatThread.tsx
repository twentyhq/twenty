import styled from '@emotion/styled';
import { useCallback, useEffect, useRef } from 'react';

import { ChatMessage } from '@/whatsapp-chat/components/ChatMessage';
import { ChatInput } from '@/whatsapp-chat/components/ChatInput';
import { type WaConversation, type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const StyledMessages = styled.div`
  background: #EEF0F3;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledLoadOlder = styled.button`
  align-self: center;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  color: #1A6CFF;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  margin: ${({ theme }) => theme.spacing(2)} auto;
  padding: 6px 16px;

  &:hover {
    background: #EBF0FF;
    border-color: #1A6CFF;
  }
`;

const StyledDateSeparator = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledDateLine = styled.div`
  background: #E5E7EB;
  flex: 1;
  height: 1px;
`;

const StyledDateLabel = styled.span`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  color: #6B7280;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 12px;
  white-space: nowrap;
`;

const StyledEmptyThread = styled.div`
  align-items: center;
  color: #9CA3AF;
  display: flex;
  flex: 1;
  font-size: 14px;
  justify-content: center;
`;

const StyledLoading = styled.div`
  align-self: center;
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const formatDateSeparator = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();

  // Compare calendar dates, not millisecond difference
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (today.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const isSameDay = (a: string, b: string): boolean => {
  const dateA = new Date(a);
  const dateB = new Date(b);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

type ChatThreadProps = {
  conversation: WaConversation;
  messages: WaMessage[];
  loading: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  onSendText: (body: string) => void;
  onSendMedia?: (file: File) => void;
  onEditMessage?: (messageId: string, newBody: string) => void;
  onDeleteMessage?: (message: WaMessage) => void;
  onForwardMessage?: (message: WaMessage) => void;
  onFlagLead?: () => void;
  onStrukturanalyse?: (message: WaMessage) => void;
};

export const ChatThread = ({
  conversation,
  messages,
  loading,
  hasMore,
  onLoadOlder,
  onSendText,
  onSendMedia,
  onEditMessage,
  onDeleteMessage,
  onForwardMessage,
  onFlagLead,
  onStrukturanalyse,
}: ChatThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const renderMessages = useCallback(() => {
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const prevMessage = i > 0 ? messages[i - 1] : null;

      const showDateSeparator =
        !prevMessage ||
        !isSameDay(prevMessage.messageTimestamp, message.messageTimestamp);

      if (showDateSeparator) {
        elements.push(
          <StyledDateSeparator key={`date-${message.messageTimestamp}`}>
            <StyledDateLine />
            <StyledDateLabel>
              {formatDateSeparator(message.messageTimestamp)}
            </StyledDateLabel>
            <StyledDateLine />
          </StyledDateSeparator>,
        );
      }

      elements.push(
        <ChatMessage
          key={message.id}
          message={message}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
          onForward={onForwardMessage}
          onFlagLead={onFlagLead}
          onStrukturanalyse={onStrukturanalyse}
        />,
      );
    }

    return elements;
  }, [messages, onEditMessage, onDeleteMessage, onForwardMessage, onFlagLead, onStrukturanalyse]);

  return (
    <StyledContainer>
      <StyledMessages ref={messagesContainerRef}>
        {loading && messages.length === 0 && (
          <StyledLoading>Loading messages...</StyledLoading>
        )}

        {!loading && messages.length === 0 && (
          <StyledEmptyThread>No messages yet</StyledEmptyThread>
        )}

        {hasMore && (
          <StyledLoadOlder onClick={onLoadOlder} disabled={loading}>
            {loading ? 'Loading...' : 'Load older messages'}
          </StyledLoadOlder>
        )}

        {renderMessages()}

        <div ref={messagesEndRef} />
      </StyledMessages>

      <ChatInput
        onSendText={onSendText}
        onSendMedia={onSendMedia}
      />
    </StyledContainer>
  );
};
