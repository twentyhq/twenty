import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

export const useIsCurrentDirectMessage = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    currentAiChatThread ?? '',
  );

  return (
    thread?.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
  );
};
