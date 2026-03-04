import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropZone } from '@/activities/files/components/DropZone';
import { AIChatEditorSection } from '@/ai/components/AIChatEditorSection';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${themeCssVariables.background.primary};
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile }) =>
    isDraggingFile ? themeCssVariables.spacing[3] : '0'};
  display: flex;
  flex-direction: column;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
  width: calc(100% - 24px) !important;
`;

export const AIChatTab = () => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const draftKey = currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const { messages, isStreaming, error } = useAgentChatContextOrThrow();
  const hasMessages = messages.length > 0;

  const { uploadFiles } = useAIChatFileUpload();

  return (
    <StyledContainer
      isDraggingFile={isDraggingFile}
      onDragEnter={() => setIsDraggingFile(true)}
    >
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={uploadFiles}
        />
      )}
      {!isDraggingFile && (
        <>
          {hasMessages && (
            <StyledScrollWrapper
              componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}
            >
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isLastMessageStreaming = isStreaming && isLastMessage;
                const isLastAssistantMessage =
                  isLastMessage && message.role === AgentMessageRole.ASSISTANT;
                const shouldShowError = error && isLastAssistantMessage;

                return (
                  <AIChatMessage
                    isLastMessageStreaming={isLastMessageStreaming}
                    message={message}
                    key={message.id}
                    error={shouldShowError ? error : null}
                  />
                );
              })}
              {error &&
                !isStreaming &&
                messages.at(-1)?.role === AgentMessageRole.USER && (
                  <AIChatStandaloneError error={error} />
                )}
            </StyledScrollWrapper>
          )}
          <AIChatEditorSection key={draftKey} />
        </>
      )}
    </StyledContainer>
  );
};
