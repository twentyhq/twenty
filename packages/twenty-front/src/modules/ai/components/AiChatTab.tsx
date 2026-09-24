import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { styled } from '@linaria/react';
import { type DragEvent, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatHasBeenOpenedEffect } from '@/ai/components/AgentChatHasBeenOpenedEffect';
import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { AiChatQueuedMessages } from '@/ai/components/AiChatQueuedMessages';
import { AiChatTabMessageList } from '@/ai/components/AiChatTabMessageList';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile }) =>
    isDraggingFile ? themeCssVariables.spacing[3] : '0'};
`;

export const AiChatTab = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const threadIdCreatedFromDraft = useAtomStateValue(
    threadIdCreatedFromDraftState,
  );
  const draftKey = currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const editorSectionKey =
    draftKey !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY &&
    draftKey === threadIdCreatedFromDraft
      ? AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      : draftKey;

  const { uploadFiles } = useAiChatFileUpload();

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }

    setIsDraggingFile(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
  };

  return (
    <StyledContainer
      isDraggingFile={isDraggingFile}
      onDragEnter={() => setIsDraggingFile(true)}
      onDragLeave={handleDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {isWorkspaceSetupChat && <WorkspaceSetupChatKickoffEffect />}
      <AgentChatHasBeenOpenedEffect />
      <AgentChatStreamingPartsDiffSyncEffect />
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={uploadFiles}
        />
      )}
      {!isDraggingFile && (
        <AiChatMessageListPreambleContext.Provider
          value={isWorkspaceSetupChat ? <WorkspaceSetupChatPreamble /> : null}
        >
          <AiChatTabMessageList />
          <AiChatQueuedMessages />
          <AiChatEditorSection key={editorSectionKey} />
        </AiChatMessageListPreambleContext.Provider>
      )}
    </StyledContainer>
  );
};
