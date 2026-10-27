import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useMarkAgentChatThreadAsDoneInChannel } from '@/ai/hooks/useMarkAgentChatThreadAsDoneInChannel';
import { useReopenAgentChatThreadInChannel } from '@/ai/hooks/useReopenAgentChatThreadInChannel';
import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteAgentChatThreadInboxAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
  const { markAgentChatThreadAsDoneInChannel } =
    useMarkAgentChatThreadAsDoneInChannel();
  const { reopenAgentChatThreadInChannel } =
    useReopenAgentChatThreadInChannel();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();

  const updateInboxState = async ({
    threadIds,
    action,
    isInChannel,
  }: {
    threadIds: string[];
    action: AgentChatInboxAction;
    isInChannel: boolean;
  }) => {
    if (isInChannel && action === AgentChatInboxAction.ARCHIVE) {
      await Promise.all(threadIds.map(markAgentChatThreadAsDoneInChannel));

      return;
    }

    if (isInChannel && action === AgentChatInboxAction.MOVE_TO_INBOX) {
      await Promise.all(threadIds.map(reopenAgentChatThreadInChannel));

      return;
    }

    await updateAgentChatThreadInboxState({ threadIds, action });
  };

  const executeAgentChatThreadInboxAction = async ({
    threadIds,
    action,
    isInChannel,
  }: {
    threadIds: string[];
    action: AgentChatInboxAction | 'assign';
    isInChannel: boolean;
  }) => {
    if (!isNonEmptyArray(threadIds) || isPending) {
      return;
    }

    if (action === AgentChatInboxAction.SNOOZE) {
      openSnoozeAiChatInSidePanel({ threadIds, isInChannel });
      return;
    }

    if (action === 'assign') {
      openAssignAiChatInSidePanel(threadIds);
      return;
    }

    setIsPending(true);

    try {
      await updateInboxState({ threadIds, action, isInChannel });
    } finally {
      setIsPending(false);
    }
  };

  return { executeAgentChatThreadInboxAction, isPending };
};
