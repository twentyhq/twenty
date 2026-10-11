import { useAgentChatChannelThreadTriage } from '@/ai/hooks/useAgentChatChannelThreadTriage';
import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AgentChatThreadInboxCommandProps = {
  action: AgentChatInboxAction | 'assign';
};

export const AgentChatThreadInboxCommand = ({
  action,
}: AgentChatThreadInboxCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
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
      (record) => record.inboxStatus?.isChannelCopy ?? false,
    );

    if (action === AgentChatInboxAction.SNOOZE) {
      return openSnoozeAiChatInSidePanel(threadIds, { isInChannel });
    }

    if (action === 'assign') {
      return openAssignAiChatInSidePanel(threadIds);
    }

    if (
      isInChannel &&
      (action === AgentChatInboxAction.ARCHIVE ||
        action === AgentChatInboxAction.MOVE_TO_INBOX)
    ) {
      await Promise.all(
        threadIds.map(
          action === AgentChatInboxAction.ARCHIVE
            ? markAgentChatThreadAsDoneInChannel
            : reopenAgentChatThreadInChannel,
        ),
      );

      return;
    }

    await updateAgentChatThreadInboxState({ threadIds, action });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
