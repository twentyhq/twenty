import { styled } from '@linaria/react';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';

import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';
import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessageComponentFamilySelector } from '@/ai/states/agentChatMessageComponentFamilySelector';
import { agentChatMessageIdsComponentSelector } from '@/ai/states/agentChatMessageIdsComponentSelector';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
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
  width: fit-content;
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

export const AIChatMessage = ({ messageId }: { messageId: string }) => {
  const agentChatMessage = useAtomComponentFamilySelectorValue(
    agentChatMessageComponentFamilySelector,
    { messageId },
  );

  const agentChatMessageIds = useAtomComponentSelectorValue(
    agentChatMessageIdsComponentSelector,
  );

  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);

  const agentChatError = useAtomStateValue(agentChatErrorState);

  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  if (!isDefined(agentChatMessage)) {
    return null;
  }

  const isLastMessage = agentChatMessageIds.at(-1) === messageId;

  const isLastMessageStreaming = agentChatIsStreaming && isLastMessage;
  const isLastAssistantMessage =
    isLastMessage && agentChatMessage?.role === AgentMessageRole.ASSISTANT;
  const shouldShowError = isDefined(agentChatError) && isLastAssistantMessage;

  const isUser = agentChatMessage.role === AgentMessageRole.USER;

  const fileParts = agentChatMessage.parts.filter(isExtendedFileUIPart);

  return (
    <StyledMessageBubble key={agentChatMessage.id} isUser={isUser}>
      <StyledMessageContainer isUser={isUser}>
        <StyledMessageText isUser={isUser}>
          <AIChatAssistantMessageRenderer
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
        {shouldShowError && <AIChatErrorRenderer error={agentChatError} />}
      </StyledMessageContainer>
      {agentChatMessage.parts.length > 0 &&
        agentChatMessage.metadata?.createdAt && (
          <StyledMessageFooter className="message-footer">
            <StyledMessageTimestamp>
              {beautifyPastDateRelativeToNow(
                agentChatMessage.metadata?.createdAt,
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
