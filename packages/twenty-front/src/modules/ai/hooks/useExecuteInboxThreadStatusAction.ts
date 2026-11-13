import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useMarkInboxThreadAsDoneInChannel } from '@/ai/hooks/useMarkInboxThreadAsDoneInChannel';
import { useReopenInboxThreadInChannel } from '@/ai/hooks/useReopenInboxThreadInChannel';
import { useUpdateInboxThreadStatus } from '@/ai/hooks/useUpdateInboxThreadStatus';
import { useOpenAssignInboxInSidePanel } from '@/side-panel/hooks/useOpenAssignInboxInSidePanel';
import { useOpenSnoozeInboxInSidePanel } from '@/side-panel/hooks/useOpenSnoozeInboxInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteInboxThreadStatusAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAgentChatThreadInboxState } = useUpdateInboxThreadStatus();
  const { markAgentChatThreadAsDoneInChannel } =
    useMarkInboxThreadAsDoneInChannel();
  const { reopenAgentChatThreadInChannel } = useReopenInboxThreadInChannel();
  const { openSnoozeInboxInSidePanel } = useOpenSnoozeInboxInSidePanel();
  const { openAssignInboxInSidePanel } = useOpenAssignInboxInSidePanel();

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
      openSnoozeInboxInSidePanel({ threadIds, isInChannel });
      return;
    }

    if (action === 'assign') {
      openAssignInboxInSidePanel(threadIds);
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
