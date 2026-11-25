import { useStore } from 'jotai';

import { useSnoozeInboxThreadsInChannel } from '@/inbox/hooks/useSnoozeInboxThreadsInChannel';
import { useUpdateAiChatThreadInboxState } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadInboxState';
import { isSnoozeInboxForChannelComponentState } from '@/side-panel/states/isSnoozeInboxForChannelComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useSnoozeAiChatThreads = () => {
  const store = useStore();
  const isSnoozeInboxForChannelState = useAtomComponentStateCallbackState(
    isSnoozeInboxForChannelComponentState,
  );
  const { updateAiChatThreadInboxState } = useUpdateAiChatThreadInboxState();
  const { snoozeInboxThreadsInChannel } = useSnoozeInboxThreadsInChannel();

  const snoozeAiChatThreads = ({
    threadIds,
    snoozedUntil,
  }: {
    threadIds: string[];
    snoozedUntil: Date;
  }) =>
    store.get(isSnoozeInboxForChannelState)
      ? snoozeInboxThreadsInChannel({ threadIds, snoozedUntil })
      : updateAiChatThreadInboxState({
          threadIds,
          action: AgentChatInboxAction.SNOOZE,
          snoozedUntil,
        });

  return { snoozeAiChatThreads };
};
