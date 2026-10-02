import { isDefined } from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';

type AgentChatThreadInboxSingleRecordCommandProps = {
  action: 'read' | 'unread' | 'done' | 'reopen' | 'snooze';
};

export const AgentChatThreadInboxSingleRecordCommand = ({
  action,
}: AgentChatThreadInboxSingleRecordCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const {
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    moveAgentChatThreadToInbox,
  } = useAgentChatThreadParticipants();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  const handleExecute = async () => {
    const threadId = selectedRecords[0]?.id;

    if (!isDefined(threadId)) {
      return;
    }

    switch (action) {
      case 'read':
        return markAgentChatThreadAsRead(threadId);
      case 'unread':
        return markAgentChatThreadAsUnread(threadId);
      case 'done':
        return archiveAgentChatThread(threadId);
      case 'reopen':
        return moveAgentChatThreadToInbox(threadId);
      case 'snooze':
        return openSnoozeAiChatInSidePanel(threadId);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
