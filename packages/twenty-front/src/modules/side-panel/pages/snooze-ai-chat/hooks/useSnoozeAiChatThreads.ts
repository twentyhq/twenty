import { useAgentChatChannelThreadTriage } from '@/ai/hooks/useAgentChatChannelThreadTriage';
import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { snoozeAiChatIsInChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatIsInChannelComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useSnoozeAiChatThreads = () => {
  const snoozeAiChatIsInChannel = useAtomComponentStateValue(
    snoozeAiChatIsInChannelComponentState,
  );
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();
  const { snoozeAgentChatThreadsInChannel } = useAgentChatChannelThreadTriage();

  const snoozeAiChatThreads = ({
    threadIds,
    snoozedUntil,
  }: {
    threadIds: string[];
    snoozedUntil: Date;
  }) =>
    snoozeAiChatIsInChannel
      ? snoozeAgentChatThreadsInChannel({ threadIds, snoozedUntil })
      : updateAgentChatThreadInboxState({
          threadIds,
          action: AgentChatInboxAction.SNOOZE,
          snoozedUntil,
        });

  return { snoozeAiChatThreads };
};
