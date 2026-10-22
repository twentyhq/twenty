import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteAgentChatThreadInboxAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();

  const executeAgentChatThreadInboxAction = async ({
    threadIds,
    action,
  }: {
    threadIds: string[];
    action: AgentChatInboxAction | 'assign';
  }) => {
    if (!isNonEmptyArray(threadIds) || isPending) {
      return;
    }

    if (action === AgentChatInboxAction.SNOOZE) {
      openSnoozeAiChatInSidePanel(threadIds);
      return;
    }

    if (action === 'assign') {
      openAssignAiChatInSidePanel(threadIds);
      return;
    }

    setIsPending(true);

    try {
      await updateAgentChatThreadInboxState({ threadIds, action });
    } finally {
      setIsPending(false);
    }
  };

  return { executeAgentChatThreadInboxAction, isPending };
};
