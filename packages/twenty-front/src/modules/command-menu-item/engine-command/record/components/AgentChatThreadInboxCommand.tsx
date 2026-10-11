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
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();

  const handleExecute = async () => {
    const threadIds = selectedRecords.map(({ id }) => id);

    if (threadIds.length === 0) {
      return;
    }

    if (action === AgentChatInboxAction.SNOOZE) {
      return openSnoozeAiChatInSidePanel(threadIds);
    }

    if (action === 'assign') {
      return openAssignAiChatInSidePanel(threadIds);
    }

    await updateAgentChatThreadInboxState({ threadIds, action });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
