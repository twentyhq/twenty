import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  IconCopy,
  IconCheck,
  IconMessage,
  IconRefresh,
  IconAlertCircle,
  IconRobot,
  IconUser,
  IconSend,
  IconTrash,
} from 'twenty-ui/display';
import {
  useSalesAngel,
  extractSuggestion,
  type AgentMessage,
} from '@/whatsapp-chat/hooks/useSalesAngel';
import { useSuppressHotkeys } from '@/whatsapp-chat/hooks/useSuppressHotkeys';

// ── Suggested Prompts ────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'Was ist der empfohlene nächste Schritt?',
  'Was ist die Urmotivation dieser Person?',
  'Was ist ihre größte Erfolgsblockade?',
  'Wie sollte ich das Gespräch energetisch eröffnen?',
];

// ── Styled Components ────────────────────────────────────────────

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: #1f2c34;
  border-bottom: 1px solid #2a3942;
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  color: #e9edef;
  display: flex;
  font-size: 13px;
  font-weight: 600;
  gap: 8px;
`;

const StyledSessionBadge = styled.span`
  color: #8696a0;
  font-size: 10px;
  font-weight: 400;
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #8696a0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 6px;

  &:hover {
    background: #2a3942;
    color: #e9edef;
  }
`;

const StyledErrorBanner = styled.div`
  align-items: center;
  background: rgba(234, 67, 53, 0.1);
  border-bottom: 1px solid rgba(234, 67, 53, 0.2);
  color: #ea4335;
  display: flex;
  font-size: 12px;
  gap: 6px;
  padding: 8px 12px;
`;

const StyledRetryButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid #ea4335;
  border-radius: 4px;
  color: #ea4335;
  cursor: pointer;
  display: flex;
  font-size: 11px;
  gap: 4px;
  margin-left: auto;
  padding: 4px 8px;

  &:hover {
    background: rgba(234, 67, 53, 0.1);
  }
`;

const StyledMessagesContainer = styled.div`
  background: #111b21;
  flex: 1;
  overflow: auto;
  padding: 12px;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: #8696a0;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  text-align: center;
`;

const StyledEmptyTitle = styled.h4`
  color: #e9edef;
  font-size: 14px;
  font-weight: 500;
  margin: 12px 0 8px;
`;

const StyledEmptyText = styled.p`
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 16px;
`;

const StyledPromptsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
  width: 100%;
`;

const StyledPromptsLabel = styled.span`
  color: #8696a0;
  font-size: 10px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const StyledPromptButton = styled.button`
  background: #1f2c34;
  border: 1px solid #2a3942;
  border-radius: 8px;
  color: #e9edef;
  cursor: pointer;
  font-size: 12px;
  padding: 10px 12px;
  text-align: left;

  &:hover {
    background: #2a3942;
    border-color: #00a884;
  }
`;

const StyledMessageRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
`;

const StyledAvatar = styled.div<{ variant: 'user' | 'assistant' }>`
  align-items: center;
  background: ${({ variant }) =>
    variant === 'user' ? '#00a884' : '#5865f2'};
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledMessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledMessageHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
`;

const StyledSender = styled.span`
  color: #e9edef;
  font-size: 12px;
  font-weight: 600;
`;

const StyledTime = styled.span`
  color: #8696a0;
  font-size: 10px;
`;

const StyledBubble = styled.div<{ variant: 'user' | 'assistant' }>`
  background: ${({ variant }) =>
    variant === 'user' ? '#005c4b' : '#202c33'};
  border-radius: 8px;
  ${({ variant }) =>
    variant === 'user'
      ? 'border-top-right-radius: 2px;'
      : 'border-top-left-radius: 2px;'}
  color: #e9edef;
  font-size: 13px;
  line-height: 1.5;
  padding: ${({ variant }) =>
    variant === 'user' ? '8px 12px' : '10px 12px'};
`;

const StyledMarkdown = styled.div`
  font-size: 13px;
  line-height: 1.5;

  p {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #00a884;
  }

  em {
    color: #e9edef;
  }

  blockquote {
    background: rgba(0, 168, 132, 0.05);
    border-left: 3px solid #00a884;
    border-radius: 0 4px 4px 0;
    color: #aebac1;
    font-style: italic;
    margin: 8px 0;
    padding: 8px 12px;
  }

  code {
    background: #1a2329;
    border-radius: 4px;
    font-size: 11px;
    padding: 2px 6px;
  }

  ul,
  ol {
    margin: 8px 0;
    padding-left: 16px;
  }

  li {
    margin-bottom: 4px;
  }
`;

const StyledUserMarkdown = styled(StyledMarkdown)`
  strong {
    color: #7ee787;
  }

  blockquote {
    background: rgba(126, 231, 135, 0.05);
    border-left-color: #7ee787;
    color: #c9d1d9;
  }

  code {
    background: rgba(0, 0, 0, 0.2);
    color: #7ee787;
  }
`;

const StyledMessageActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const StyledActionButton = styled.button<{ primary?: boolean }>`
  align-items: center;
  background: ${({ primary }) =>
    primary ? 'rgba(0, 168, 132, 0.1)' : 'transparent'};
  border: 1px solid ${({ primary }) => (primary ? '#00a884' : '#3b4a54')};
  border-radius: 4px;
  color: ${({ primary }) => (primary ? '#00a884' : '#8696a0')};
  cursor: pointer;
  display: flex;
  font-size: 10px;
  gap: 4px;
  padding: 4px 8px;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledLoadingRow = styled.div`
  align-items: center;
  background: #1f2c34;
  border-radius: 8px;
  color: #8696a0;
  display: flex;
  font-size: 12px;
  gap: 8px;
  padding: 8px 12px;
`;

const StyledSpinner = styled.div`
  animation: sa-spin 1s linear infinite;
  border: 2px solid #3b4a54;
  border-radius: 50%;
  border-top-color: #00a884;
  height: 14px;
  width: 14px;

  @keyframes sa-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StyledInputContainer = styled.div`
  align-items: flex-end;
  background: #1f2c34;
  border-top: 1px solid #2a3942;
  display: flex;
  gap: 8px;
  padding: 12px;
`;

const StyledTextArea = styled.textarea`
  background: #2a3942;
  border: none;
  border-radius: 8px;
  color: #e9edef;
  flex: 1;
  font-family: inherit;
  font-size: 13px;
  max-height: 100px;
  outline: none;
  padding: 10px 12px;
  resize: none;

  &::placeholder {
    color: #8696a0;
  }
`;

const StyledSendButton = styled.button<{ disabled?: boolean }>`
  align-items: center;
  background: ${({ disabled }) => (disabled ? '#3b4a54' : '#00a884')};
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

// ── Props ────────────────────────────────────────────────────────

type SalesAngelPanelProps = {
  conversationId: string | null;
  phoneNumber: string | null;
  onCopyToChat?: (message: string) => void;
};

// ── Component ────────────────────────────────────────────────────

export const SalesAngelPanel = ({
  conversationId,
  phoneNumber,
  onCopyToChat,
}: SalesAngelPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { handleFocus: hotkeyFocus, handleBlur: hotkeyBlur } =
    useSuppressHotkeys('sales-angel-input');

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    copyToChat,
    sessionId,
  } = useSalesAngel({
    conversationId,
    phoneNumber,
    onCopyToChat,
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on conversation change
  useEffect(() => {
    if (conversationId) {
      inputRef.current?.focus();
    }
  }, [conversationId]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    setRetryMessage(message);
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

  const handleRetry = useCallback(async () => {
    if (retryMessage) {
      await sendMessage(retryMessage);
    }
  }, [retryMessage, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleCopy = useCallback(
    (messageId: string, content: string) => {
      const suggestion = extractSuggestion(content);
      const cleanContent = suggestion || content;
      navigator.clipboard.writeText(cleanContent);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    },
    [],
  );

  const handleUseInChat = useCallback(
    (content: string) => {
      copyToChat(content);
    },
    [copyToChat],
  );

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, []);

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!conversationId) {
    return (
      <StyledContainer>
        <StyledEmptyState>
          <IconRobot size={40} />
          <StyledEmptyTitle>No conversation selected</StyledEmptyTitle>
          <StyledEmptyText>
            Select a conversation from the inbox to chat with Sales Angel.
          </StyledEmptyText>
        </StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <StyledHeaderTitle>
          <IconRobot size={16} color="#00a884" />
          <span>Sales Angel</span>
          {sessionId && <StyledSessionBadge>(Session active)</StyledSessionBadge>}
        </StyledHeaderTitle>
        <StyledIconButton onClick={clearConversation} title="Clear conversation">
          <IconTrash size={14} />
        </StyledIconButton>
      </StyledHeader>

      {/* Error */}
      {error && (
        <StyledErrorBanner>
          <IconAlertCircle size={14} />
          <span>{error}</span>
          <StyledRetryButton onClick={handleRetry}>
            <IconRefresh size={10} />
            Retry
          </StyledRetryButton>
        </StyledErrorBanner>
      )}

      {/* Messages */}
      <StyledMessagesContainer>
        {messages.length === 0 ? (
          <StyledEmptyState>
            <IconRobot size={36} color="#00a884" style={{ opacity: 0.5 }} />
            <StyledEmptyTitle>Sales Angel</StyledEmptyTitle>
            <StyledEmptyText>
              I can help you craft the perfect message, understand your lead's
              pain points, and suggest next steps. Just ask me anything!
            </StyledEmptyText>
            <StyledPromptsContainer>
              <StyledPromptsLabel>Try asking:</StyledPromptsLabel>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <StyledPromptButton
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  {prompt}
                </StyledPromptButton>
              ))}
            </StyledPromptsContainer>
          </StyledEmptyState>
        ) : (
          messages.map((message: AgentMessage) => (
            <StyledMessageRow key={message.id}>
              <StyledAvatar variant={message.role}>
                {message.role === 'user' ? (
                  <IconUser size={14} />
                ) : (
                  <IconRobot size={14} />
                )}
              </StyledAvatar>
              <StyledMessageContent>
                <StyledMessageHeader>
                  <StyledSender>
                    {message.role === 'user' ? 'You' : 'Sales Angel'}
                  </StyledSender>
                  <StyledTime>{formatTime(message.timestamp)}</StyledTime>
                </StyledMessageHeader>
                <StyledBubble variant={message.role}>
                  {message.role === 'assistant' ? (
                    <>
                      <StyledMarkdown>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </StyledMarkdown>
                      <StyledMessageActions>
                        <StyledActionButton
                          onClick={() =>
                            handleCopy(message.id, message.content)
                          }
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <IconCheck size={10} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <IconCopy size={10} />
                              Copy
                            </>
                          )}
                        </StyledActionButton>
                        {onCopyToChat && (
                          <StyledActionButton
                            primary
                            onClick={() => handleUseInChat(message.content)}
                          >
                            <IconMessage size={10} />
                            Use in Chat
                          </StyledActionButton>
                        )}
                      </StyledMessageActions>
                    </>
                  ) : (
                    <StyledUserMarkdown>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </StyledUserMarkdown>
                  )}
                </StyledBubble>
              </StyledMessageContent>
            </StyledMessageRow>
          ))
        )}

        {isLoading && (
          <StyledMessageRow>
            <StyledAvatar variant="assistant">
              <IconRobot size={14} />
            </StyledAvatar>
            <StyledLoadingRow>
              <StyledSpinner />
              <span>Sales Angel is thinking...</span>
            </StyledLoadingRow>
          </StyledMessageRow>
        )}

        <div ref={messagesEndRef} />
      </StyledMessagesContainer>

      {/* Input */}
      <StyledInputContainer>
        <StyledTextArea
          ref={inputRef}
          placeholder="Ask Sales Angel..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={hotkeyFocus}
          onBlur={hotkeyBlur}
          rows={1}
          disabled={isLoading}
        />
        <StyledSendButton
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
        >
          <IconSend size={16} />
        </StyledSendButton>
      </StyledInputContainer>
    </StyledContainer>
  );
};
