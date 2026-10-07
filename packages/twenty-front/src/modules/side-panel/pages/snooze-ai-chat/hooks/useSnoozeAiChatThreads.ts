import { useAgentChatChannelThreadTriage } from '@/ai/hooks/useAgentChatChannelThreadTriage';
import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { snoozeAiChatIsInChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatIsInChannelComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useSnoozeAiChatThreads = () => {
  const snoozeAiChatIsInChannel = useAtomComponentStateValue(
    snoozeAiChatIsInChannelComponentState,
  );
  const { snoozeAgentChatThreads } = useAgentChatThreadParticipants();
  const { snoozeAgentChatThreadsInChannel } = useAgentChatChannelThreadTriage();

  return {
    snoozeAiChatThreads: snoozeAiChatIsInChannel
      ? snoozeAgentChatThreadsInChannel
      : snoozeAgentChatThreads,
  };
};
