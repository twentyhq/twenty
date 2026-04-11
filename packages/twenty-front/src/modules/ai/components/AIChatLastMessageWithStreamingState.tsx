import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/agentChatLastMessageIdComponentSelector';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AIChatLastMessageWithStreamingState = () => {
  const lastMessageId = useAtomComponentSelectorValue(
    agentChatLastMessageIdComponentSelector,
  );

  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAIChatThread },
  );
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: currentAIChatThread },
  );

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
