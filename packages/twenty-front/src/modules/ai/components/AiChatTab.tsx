import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropZone } from '@/activities/files/components/DropZone';
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

  return (
    <StyledContainer
      isDraggingFile={isDraggingFile}
      onDragEnter={() => setIsDraggingFile(true)}
      onDragLeave={() => setIsDraggingFile(false)}
    >
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={uploadFiles}
        />
      )}
      {!isDraggingFile && (
        <>
          <AiChatTabMessageList />
          <AiChatQueuedMessages />
          <AiChatEditorSection key={editorSectionKey} />
        </>
      )}
    </StyledContainer>
  );
};
