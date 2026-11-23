import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { useMarkAiChatThreadAsDoneInChannel } from '@/ai-chat/threads/hooks/useMarkAiChatThreadAsDoneInChannel';
import { useReopenAiChatThreadInChannel } from '@/ai-chat/threads/hooks/useReopenAiChatThreadInChannel';
import { useUpdateAiChatThreadInboxState } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadInboxState';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useExecuteAiChatThreadStatusAction = () => {
  const [isPending, setIsPending] = useState(false);
  const { updateAiChatThreadInboxState } = useUpdateAiChatThreadInboxState();
  const { markAiChatThreadAsDoneInChannel } =
    useMarkAiChatThreadAsDoneInChannel();
  const { reopenAiChatThreadInChannel } = useReopenAiChatThreadInChannel();
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
      await Promise.all(threadIds.map(markAiChatThreadAsDoneInChannel));

      return;
    }

    if (isInChannel && action === AgentChatInboxAction.MOVE_TO_INBOX) {
      await Promise.all(threadIds.map(reopenAiChatThreadInChannel));

      return;
    }

    await updateAiChatThreadInboxState({ threadIds, action });
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
