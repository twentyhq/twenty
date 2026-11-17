import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatLastMessageIdComponentSelector } from '@/ai/states/selectors/aiChatLastMessageIdComponentSelector';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const aiChatLastMessageId = useAtomComponentSelectorValue(
    aiChatLastMessageIdComponentSelector,
  );

  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: aiChatDisplayedThread },
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
  });

  if (!isDefined(aiChatLastMessageId)) {
    return null;
  }

  return (
    <AiChatMessage
      messageId={aiChatLastMessageId}
      isLastMessageStreaming={aiChatIsStreaming}
      error={aiChatError ?? undefined}
    />
  );
};
