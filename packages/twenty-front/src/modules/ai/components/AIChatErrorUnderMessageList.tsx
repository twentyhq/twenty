import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { agentChatMessageIdsComponentSelector } from '@/ai/states/agentChatMessageIdsComponentSelector';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AIChatErrorUnderMessageList = () => {
  const agentChatError = useAtomStateValue(agentChatErrorState);
  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);
  const agentChatMessageIds = useAtomComponentSelectorValue(
    agentChatMessageIdsComponentSelector,
  );
  const lastMessageId = agentChatMessageIds.at(-1);
  const agentChatMessage = useAtomComponentFamilyStateValue(
    agentChatMessageComponentFamilyState,
    lastMessageId ?? '',
  );

  const showError =
    agentChatError &&
    !agentChatIsStreaming &&
    agentChatMessage?.role === AgentMessageRole.USER;

  if (!showError) {
    return null;
  }

  return <AIChatStandaloneError error={agentChatError} />;
};
