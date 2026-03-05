import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropZone } from '@/activities/files/components/DropZone';
import { AIChatEditorSection } from '@/ai/components/AIChatEditorSection';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { useAiModelLabel } from '@/ai/hooks/useAiModelOptions';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatTabMessageList } from '@/ai/components/AIChatTabMessageList';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useAIChatEditor } from '@/ai/hooks/useAIChatEditor';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
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

const StyledInputArea = styled.div<{ isMobile: boolean }>`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-inline: ${themeCssVariables.spacing[3]};
  padding-block: ${({ isMobile }) =>
    isMobile ? '0' : themeCssVariables.spacing[3]};
  background: ${themeCssVariables.background.primary};
`;

const StyledInputBox = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 140px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: 0px 0px 0px 3px ${themeCssVariables.color.transparent.blue2};
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
    color: ${themeCssVariables.font.color.primary};
    font-family: inherit;
    font-size: ${themeCssVariables.font.size.md};
    font-weight: ${themeCssVariables.font.weight.regular};
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
      color: ${themeCssVariables.font.color.light};
      content: attr(data-placeholder);
      float: left;
      font-weight: ${themeCssVariables.font.weight.regular};
      height: 0;
      pointer-events: none;
    }
  }
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
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRightButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledReadOnlyModelButtonContainer = styled.div`
  > * {
    cursor: default;

    &:hover,
    &:active {
      background: transparent;
    }
  }
`;

export const AIChatTab = () => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const draftKey = currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const { messages, isStreaming, error } = useAgentChatContextOrThrow();
  const hasMessages = messages.length > 0;

  const { uploadFiles } = useAIChatFileUpload();
  const isMobile = useIsMobile();

  const { uploadFiles } = useAIChatFileUpload();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const smartModelLabel = useAiModelLabel(currentWorkspace?.smartModel, false);

  const { editor, handleSendAndClear } = useAIChatEditor();

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
          <AIChatTabMessageList />
          <AIChatEmptyState editor={editor} />
          <AIChatStandaloneError />
          <AIChatSkeletonLoader />
          <AIChatEditorSection />
        </>
      )}
    </StyledContainer>
  );
};
