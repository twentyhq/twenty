import { useAgentChatChannelThreadTriage } from '@/ai/hooks/useAgentChatChannelThreadTriage';
import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';

type AgentChatThreadInboxCommandProps = {
  action:
    | 'read'
    | 'unread'
    | 'done'
    | 'reopen'
    | 'snooze'
    | 'assign'
    | 'subscribe'
    | 'unsubscribe';
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
    subscribeToAgentChatThread,
    unsubscribeFromAgentChatThread,
  } = useAgentChatThreadParticipants();
  const { markAgentChatThreadAsDoneInChannel, reopenAgentChatThreadInChannel } =
    useAgentChatChannelThreadTriage();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();

  const handleExecute = async () => {
    const threadIds = selectedRecords.map(({ id }) => id);

    if (threadIds.length === 0) {
      return;
    }

    // A channel's view files its chats for the whole channel
    const isInChannel = selectedRecords.every(
      (record) => record.inboxStatus?.isChannelCopy === true,
    );

    if (action === 'snooze') {
      return openSnoozeAiChatInSidePanel(threadIds, { isInChannel });
    }

    if (action === 'assign') {
      return openAssignAiChatInSidePanel(threadIds);
    }

    const updateThread = {
      read: markAgentChatThreadAsRead,
      unread: markAgentChatThreadAsUnread,
      done: isInChannel
        ? markAgentChatThreadAsDoneInChannel
        : archiveAgentChatThread,
      reopen: isInChannel
        ? reopenAgentChatThreadInChannel
        : moveAgentChatThreadToInbox,
      subscribe: subscribeToAgentChatThread,
      unsubscribe: unsubscribeFromAgentChatThread,
    }[action];

    // One at a time: a failed update reloads every chat's state, which would
    // undo the optimistic change of an update still on its way
    for (const threadId of threadIds) {
      await updateThread(threadId);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
