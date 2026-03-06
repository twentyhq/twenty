import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessageComponentFamilySelector } from '@/ai/states/agentChatMessageComponentFamilySelector';
import { agentChatMessageIdsComponentSelector } from '@/ai/states/agentChatMessageIdsComponentSelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AIChatErrorUnderMessageList = () => {
  const agentChatError = useAtomStateValue(agentChatErrorState);
  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);

  const agentChatMessageIds = useAtomComponentSelectorValue(
    agentChatMessageIdsComponentSelector,
  );

  const lastMessageId = agentChatMessageIds.at(-1);
  const agentChatMessage = useAtomComponentFamilySelectorValue(
    agentChatMessageComponentFamilySelector,
    { messageId: lastMessageId },
  );

  const showError =
    agentChatError &&
    !agentChatIsStreaming &&
    agentChatMessage?.role === AgentMessageRole.USER;

  if (!showError) {
    return null;
  }

  return <AIChatStandaloneError />;
};
