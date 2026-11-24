import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { styled } from '@linaria/react';
import { type DragEvent, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { DropZone } from '@/activities/files/components/DropZone';
import { AiChatEditorSection } from '@/ai-chat/composer/components/AiChatEditorSection';
import { AiChatNewThreadRecipientBar } from '@/ai-chat/composer/components/AiChatNewThreadRecipientBar';
import { useAiChatFileUpload } from '@/ai-chat/composer/hooks/useAiChatFileUpload';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

import { AiChatQueuedMessages } from '@/ai-chat/composer/components/AiChatQueuedMessages';
import { AiChatTabMessageList } from '@/ai-chat/messages/components/AiChatTabMessageList';

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
  const { threadId } = useAiChatInstanceOrThrow();
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

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
      onDragEnter={() => !isDirectMessage && setIsDraggingFile(true)}
      onDragLeave={handleDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={(files) => uploadFiles({ files, threadId })}
        />
      )}
      {!isDraggingFile && (
        <>
          <AiChatNewThreadRecipientBar />
          <AiChatTabMessageList />
          <AiChatQueuedMessages />
          <AiChatEditorSection key={threadId} />
        </>
      )}
    </StyledContainer>
  );
};
