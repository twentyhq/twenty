import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/agentChatLastMessageIdComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AIChatLastMessageWithStreamingState = () => {
  const lastMessageId = useAtomComponentSelectorValue(
    agentChatLastMessageIdComponentSelector,
  );

  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);
  const agentChatError = useAtomStateValue(agentChatErrorState);

  if (!isDefined(lastMessageId)) {
    return null;
  }

  return (
    <AIChatMessage
      messageId={lastMessageId}
      isLastMessageStreaming={agentChatIsStreaming}
      error={agentChatError ?? undefined}
    />
  );
};
