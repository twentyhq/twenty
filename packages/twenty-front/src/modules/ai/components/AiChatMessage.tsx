import { styled } from '@linaria/react';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';

import { AiChatAssistantMessageRenderer } from '@/ai/components/AiChatAssistantMessageRenderer';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { agentChatMessageComponentFamilySelector } from '@/ai/states/selectors/agentChatMessageComponentFamilySelector';
import { type AiChatError } from '@/ai/types/AiChatError';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
  background: ${({ isUser }) =>
    isUser ? themeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${({ isUser }) =>
    isUser ? themeCssVariables.border.radius.sm : '0'};
  color: ${({ isUser }) =>
    isUser
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: normal;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
  /* Pre-wrap within the whole container turns every newline between block
     elements into extra spacing; keep normal flow and only pre-wrap code. */
  word-wrap: break-word;

  code {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    line-height: 1.4;
    max-width: 100%;
    overflow: auto;
    padding: 1px 3px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  pre {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    max-width: 100%;
    overflow-x: auto;
    padding: ${themeCssVariables.spacing[2]};

    code {
      background: none;
      border-radius: 0;
      padding: 0;
    }
  }

  p {
    line-height: 1.4em;
    margin-block: ${({ isUser }) =>
      isUser ? '0' : themeCssVariables.spacing[1]};
  }

  ul,
  ol {
    line-height: 1.4em;
    margin: ${themeCssVariables.spacing[1]} 0;
    padding-left: ${themeCssVariables.spacing[4]};
  }

  ul {
    list-style-type: disc;
  }

  li {
    line-height: 1.4em;
    margin: ${themeCssVariables.spacing['0.5']} 0;
    padding-bottom: ${themeCssVariables.spacing['0.5']};
    padding-top: ${themeCssVariables.spacing['0.5']};
  }

  blockquote {
    border-left: 3px solid ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.secondary};
    margin: ${themeCssVariables.spacing[2]} 0;
    padding-left: ${themeCssVariables.spacing[2]};
  }
`;

const StyledMessageFooter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[1]};
  opacity: 0;
  pointer-events: none;
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;
  width: 100%;
`;

const StyledMessageTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledMessageContainer = styled.div<{ isUser?: boolean }>`
  max-width: 100%;
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type AiChatMessageProps = {
  messageId: string;
  isLastMessageStreaming?: boolean;
  error?: AiChatError | undefined;
};

export const AiChatMessage = ({
  messageId,
  isLastMessageStreaming = false,
  error,
}: AiChatMessageProps) => {
  const agentChatMessage = useAtomComponentFamilySelectorValue(
    agentChatMessageComponentFamilySelector,
    { messageId },
  );

  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  if (!isDefined(agentChatMessage)) {
    return null;
  }

  const isUser = agentChatMessage.role === AgentMessageRole.USER;
  const isLastAssistantMessage =
    agentChatMessage.role === AgentMessageRole.ASSISTANT;
  const shouldShowError = isDefined(error) && isLastAssistantMessage;

  const fileParts = agentChatMessage.parts.filter(isExtendedFileUIPart);

  return (
    <StyledMessageBubble isUser={isUser}>
      <StyledMessageContainer isUser={isUser}>
        <StyledMessageText isUser={isUser}>
          <AiChatAssistantMessageRenderer
            isLastMessageStreaming={isLastMessageStreaming}
            messageParts={agentChatMessage.parts}
            hasError={shouldShowError}
          />
        </StyledMessageText>
        {fileParts.length > 0 && (
          <StyledFilesContainer>
            {fileParts.map((file) => (
              <AgentChatFilePreview key={file.filename} file={file} />
            ))}
          </StyledFilesContainer>
        )}
        {shouldShowError && isDefined(error) && (
          <AiChatErrorRenderer error={error} />
        )}
      </StyledMessageContainer>
      {agentChatMessage.parts.length > 0 && (
        <StyledMessageFooter className="message-footer">
          <StyledMessageTimestamp>
            {beautifyPastDateRelativeToNow(
              agentChatMessage.metadata?.createdAt ?? new Date(),
              localeCatalog,
            )}
          </StyledMessageTimestamp>
          <LightCopyIconButton
            copyText={
              agentChatMessage.parts.find((part) => part.type === 'text')
                ?.text ?? ''
            }
          />
        </StyledMessageFooter>
      )}
    </StyledMessageBubble>
  );
};
