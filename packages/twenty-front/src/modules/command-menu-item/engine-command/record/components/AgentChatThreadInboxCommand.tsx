import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';

type AgentChatThreadInboxCommandProps = {
  action: 'read' | 'unread' | 'done' | 'reopen' | 'snooze';
};

export const AgentChatThreadInboxCommand = ({
  action,
}: AgentChatThreadInboxCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const {
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    moveAgentChatThreadToInbox,
  } = useAgentChatThreadParticipants();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  const handleExecute = async () => {
    const threadIds = selectedRecords.map(({ id }) => id);

    if (threadIds.length === 0) {
      return;
    }

    if (action === 'snooze') {
      return openSnoozeAiChatInSidePanel(threadIds);
    }

    const updateThread = {
      read: markAgentChatThreadAsRead,
      unread: markAgentChatThreadAsUnread,
      done: archiveAgentChatThread,
      reopen: moveAgentChatThreadToInbox,
    }[action];

    await Promise.all(threadIds.map(updateThread));
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
