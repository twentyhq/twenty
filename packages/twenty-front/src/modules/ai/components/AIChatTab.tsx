import styled from '@emotion/styled';
import { EditorContent } from '@tiptap/react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { LightButton } from 'twenty-ui/input';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { useAiModelLabel } from '@/ai/hooks/useAiModelOptions';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AIChatContextUsageButton } from '@/ai/components/internal/AIChatContextUsageButton';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useAIChatEditor } from '@/ai/hooks/useAIChatEditor';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile, theme }) =>
    isDraggingFile ? theme.spacing(3) : '0'};
  display: flex;
  flex-direction: column;
`;

const StyledInputArea = styled.div<{ isMobile: boolean }>`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
  padding-block: ${({ theme, isMobile }) => (isMobile ? 0 : theme.spacing(3))};
  background: ${({ theme }) => theme.background.primary};
`;

const StyledInputBox = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 140px;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.color.transparent.blue2};
  }
`;

const StyledEditorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .tiptap {
    background: transparent;
    border: none;
    box-shadow: none;
    color: ${({ theme }) => theme.font.color.primary};
    font-family: inherit;
    font-size: ${({ theme }) => theme.font.size.md};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    line-height: 16px;
    outline: none;
    padding: 0;
    min-height: 48px;
    max-height: 320px;
    overflow-y: auto;

    p {
      margin: 0;
    }

    p.is-editor-empty:first-of-type::before {
      color: ${({ theme }) => theme.font.color.light};
      content: attr(data-placeholder);
      float: left;
      font-weight: ${({ theme }) => theme.font.weight.regular};
      height: 0;
      pointer-events: none;
    }
  }
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  width: calc(100% - 24px);
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledRightButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledReadOnlyModelButton = styled(LightButton)`
  cursor: default;

  &:hover,
  &:active {
    background: transparent;
  }
`;

export const AIChatTab = () => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isMobile = useIsMobile();
  const { isLoading, messages, isStreaming, error, handleSendMessage } =
    useAgentChatContextOrThrow();
  const hasMessages = messages.length > 0;

  const { uploadFiles } = useAIChatFileUpload();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const smartModelLabel = useAiModelLabel(currentWorkspace?.smartModel, false);

  const { editor, handleSendAndClear } = useAIChatEditor({
    onSendMessage: handleSendMessage,
  });

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
          {!hasMessages && !error && !isLoading && (
            <AIChatEmptyState editor={editor} />
          )}
          {!hasMessages && error && !isLoading && (
            <AIChatStandaloneError error={error} />
          )}
          {isLoading && !hasMessages && <AIChatSkeletonLoader />}

          <StyledInputArea isMobile={isMobile}>
            <AgentChatContextPreview />
            <StyledInputBox>
              <StyledEditorWrapper>
                <EditorContent editor={editor} />
              </StyledEditorWrapper>
              <StyledButtonsContainer>
                <StyledLeftButtonsContainer>
                  <AgentChatFileUploadButton />
                  {hasMessages && <AIChatContextUsageButton />}
                </StyledLeftButtonsContainer>
                <StyledRightButtonsContainer>
                  <StyledReadOnlyModelButton
                    accent="tertiary"
                    title={smartModelLabel}
                  />
                  <SendMessageButton onSend={handleSendAndClear} />
                </StyledRightButtonsContainer>
              </StyledButtonsContainer>
            </StyledInputBox>
          </StyledInputArea>
        </>
      )}
    </StyledContainer>
  );
};
