import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useMarkAiChatThreadAsDoneInChannel } from '@/ai/hooks/useMarkAiChatThreadAsDoneInChannel';
import { useReopenAiChatThreadInChannel } from '@/ai/hooks/useReopenAiChatThreadInChannel';
import { useUpdateAiChatThreadStatus } from '@/ai/hooks/useUpdateAiChatThreadStatus';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteAiChatThreadStatusAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();
  const { markAgentChatThreadAsDoneInChannel } =
    useMarkAiChatThreadAsDoneInChannel();
  const { reopenAgentChatThreadInChannel } = useReopenAiChatThreadInChannel();
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

  const executeAiChatThreadStatusAction = async ({
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

  return { executeAiChatThreadStatusAction, isPending };
};
