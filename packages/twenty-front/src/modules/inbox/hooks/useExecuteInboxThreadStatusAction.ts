import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useMarkInboxThreadAsDoneInChannel } from '@/inbox/hooks/useMarkInboxThreadAsDoneInChannel';
import { useReopenInboxThreadInChannel } from '@/inbox/hooks/useReopenInboxThreadInChannel';
import { useUpdateInboxThreadStatus } from '@/inbox/hooks/useUpdateInboxThreadStatus';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteInboxThreadStatusAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAgentChatThreadInboxState } = useUpdateInboxThreadStatus();
  const { markAgentChatThreadAsDoneInChannel } =
    useMarkInboxThreadAsDoneInChannel();
  const { reopenAgentChatThreadInChannel } = useReopenInboxThreadInChannel();
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

  const executeInboxThreadStatusAction = async ({
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

  return { executeInboxThreadStatusAction, isPending };
};
