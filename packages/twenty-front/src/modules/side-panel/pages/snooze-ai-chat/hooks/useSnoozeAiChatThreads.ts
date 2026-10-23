import { useStore } from 'jotai';

import { useSnoozeAgentChatThreadsInChannel } from '@/ai/hooks/useSnoozeAgentChatThreadsInChannel';
import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { isSnoozeAiChatForChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/isSnoozeAiChatForChannelComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useSnoozeAiChatThreads = () => {
  const store = useStore();
  const isSnoozeAiChatForChannelState = useAtomComponentStateCallbackState(
    isSnoozeAiChatForChannelComponentState,
  );
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
  const { snoozeAgentChatThreadsInChannel } =
    useSnoozeAgentChatThreadsInChannel();

  const snoozeAiChatThreads = ({
    threadIds,
    snoozedUntil,
  }: {
    threadIds: string[];
    snoozedUntil: Date;
  }) =>
    store.get(isSnoozeAiChatForChannelState)
      ? snoozeAgentChatThreadsInChannel({ threadIds, snoozedUntil })
      : updateAgentChatThreadInboxState({
          threadIds,
          action: AgentChatInboxAction.SNOOZE,
          snoozedUntil,
        });

  return { snoozeAiChatThreads };
};
