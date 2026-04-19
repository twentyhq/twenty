import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/agentChatLastMessageIdComponentSelector';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AiChatLastMessageWithStreamingState = () => {
  const lastMessageId = useAtomComponentSelectorValue(
    agentChatLastMessageIdComponentSelector,
  );

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  if (!isDefined(lastMessageId)) {
    return null;
  }

  return (
    <AiChatMessage
      messageId={lastMessageId}
      isLastMessageStreaming={agentChatIsStreaming}
      error={agentChatError ?? undefined}
    />
  );
};
