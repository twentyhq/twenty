import { useStore } from 'jotai';

import { useSnoozeInboxThreadsInChannel } from '@/ai/hooks/useSnoozeAgentChatThreadsInChannel';
import { useUpdateInboxThreadStatus } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { isSnoozeInboxForChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/isSnoozeAiChatForChannelComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useSnoozeInboxThreads = () => {
  const store = useStore();
  const isSnoozeInboxForChannelState = useAtomComponentStateCallbackState(
    isSnoozeInboxForChannelComponentState,
  );
  const { updateAgentChatThreadInboxState } = useUpdateInboxThreadStatus();
  const { snoozeInboxThreadsInChannel } = useSnoozeInboxThreadsInChannel();

  const snoozeInboxThreads = ({
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

  return { snoozeInboxThreads };
};
