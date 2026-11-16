import { useStore } from 'jotai';

import { useSnoozeInboxThreadsInChannel } from '@/inbox/hooks/useSnoozeInboxThreadsInChannel';
import { useUpdateAiChatThreadStatus } from '@/ai/hooks/useUpdateAiChatThreadStatus';
import { isSnoozeInboxForChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/isSnoozeInboxForChannelComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useSnoozeAiChatThreads = () => {
  const store = useStore();
  const isSnoozeInboxForChannelState = useAtomComponentStateCallbackState(
    isSnoozeInboxForChannelComponentState,
  );
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();
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
      : updateAgentChatThreadInboxState({
          threadIds,
          action: AgentChatInboxAction.SNOOZE,
          snoozedUntil,
        });

  return { snoozeAiChatThreads };
};
