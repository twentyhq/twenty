import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';

import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';
import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &:hover .message-footer {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledMessageText = styled.div<{ isUser?: boolean }>`
  background: ${({ theme, isUser }) =>
    isUser ? theme.background.tertiary : theme.background.transparent};
  border-radius: ${({ theme, isUser }) =>
    isUser ? theme.border.radius.sm : '0'};
  color: ${({ theme, isUser }) =>
    isUser ? theme.font.color.secondary : theme.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  max-width: 100%;
  padding: ${({ theme, isUser }) => (isUser ? theme.spacing(1, 2) : 0)};
  width: fit-content;
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* Pre-wrap within the whole container turns every newline between block
     elements into extra spacing; keep normal flow and only pre-wrap code. */
  white-space: normal;

  code {
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.4;
    padding: ${({ theme }) => theme.spacing(1)};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    background: ${({ theme }) => theme.background.tertiary};
  }

  pre {
    background: ${({ theme }) => theme.background.tertiary};
    padding: ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    overflow-x: auto;
    max-width: 100%;

    code {
      padding: 0;
      border-radius: 0;
      background: none;
    }
  }

  p {
    margin-block: ${({ isUser, theme }) =>
      isUser ? '0' : `${theme.spacing(1)}`};
    line-height: 1.5;
  }

  ul,
  ol {
    margin: ${({ theme }) => theme.spacing(1)} 0;
    padding-left: ${({ theme }) => theme.spacing(4)};
  }

  li {
    margin: ${({ theme }) => theme.spacing(0.5)} 0;
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.border.color.medium};
    margin: ${({ theme }) => theme.spacing(2)} 0;
    padding-left: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.font.color.secondary};
  }
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

const StyledMessageContainer = styled.div<{ isUser?: boolean }>`
  max-width: 100%;
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const AIChatMessage = ({
  message,
  isLastMessageStreaming,
  error,
}: {
  message: ExtendedUIMessage;
  isLastMessageStreaming: boolean;
  error?: Error | null;
}) => {
  const { localeCatalog } = useRecoilValue(dateLocaleState);

  const isUser = message.role === AgentMessageRole.USER;
  const showError =
    isDefined(error) && message.role === AgentMessageRole.ASSISTANT;

  const fileParts = message.parts.filter((part) => part.type === 'file');

  return (
    <StyledMessageBubble key={message.id} isUser={isUser}>
      <StyledMessageContainer isUser={isUser}>
        <StyledMessageText isUser={isUser}>
          <AIChatAssistantMessageRenderer
            isLastMessageStreaming={isLastMessageStreaming}
            messageParts={message.parts}
            hasError={showError}
          />
        </StyledMessageText>
        {fileParts.length > 0 && (
          <StyledFilesContainer>
            {fileParts.map((file) => (
              <AgentChatFilePreview key={file.filename} file={file} />
            ))}
          </StyledFilesContainer>
        )}
        {showError && <AIChatErrorRenderer error={error} />}
      </StyledMessageContainer>
      {message.parts.length > 0 && message.metadata?.createdAt && (
        <StyledMessageFooter className="message-footer">
          <span>
            {beautifyPastDateRelativeToNow(
              message.metadata?.createdAt,
              localeCatalog,
            )}
          </span>
          <LightCopyIconButton
            copyText={
              message.parts.find((part) => part.type === 'text')?.text ?? ''
            }
          />
        </StyledMessageFooter>
      )}
    </StyledMessageBubble>
  );
};
