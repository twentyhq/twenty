import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { styled } from '@linaria/react';
import { type DragEvent, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatHasBeenOpenedEffect } from '@/ai/components/AgentChatHasBeenOpenedEffect';
import { InboxThreadMarkAsReadEffect } from '@/ai/components/InboxThreadMarkAsReadEffect';
import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { InboxEditorSection } from '@/ai/components/InboxEditorSection';
import { InboxNewThreadRecipientBar } from '@/ai/components/InboxNewThreadRecipientBar';
import { useInboxFileUpload } from '@/ai/hooks/useInboxFileUpload';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { AiChatQueuedMessages } from '@/ai/components/AiChatQueuedMessages';
import { InboxTabMessageList } from '@/ai/components/InboxTabMessageList';
import { InboxTypingParticipants } from '@/ai/components/InboxTypingParticipants';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile }) =>
    isDraggingFile ? themeCssVariables.spacing[3] : '0'};
`;

export const InboxTab = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    currentInboxThread,
  );

  const { uploadFiles } = useInboxFileUpload();

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
      {isWorkspaceSetupChat && <WorkspaceSetupChatKickoffEffect />}
      <AgentChatHasBeenOpenedEffect />
      <InboxThreadMarkAsReadEffect />
      <AgentChatStreamingPartsDiffSyncEffect />
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={uploadFiles}
        />
      )}
      {!isDraggingFile && (
        <>
          <InboxNewThreadRecipientBar />
          <InboxTabMessageList />
          <InboxTypingParticipants />
          <AiChatQueuedMessages />
          <InboxEditorSection key={currentInboxThread} />
        </>
      )}
    </StyledContainer>
  );
};
