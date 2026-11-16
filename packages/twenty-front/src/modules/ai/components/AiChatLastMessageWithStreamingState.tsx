import { useAiChatDisplayedThreadId } from '@/ai/hooks/useAiChatDisplayedThreadId';
import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatLastMessageIdSelector } from '@/ai/states/selectors/aiChatLastMessageIdSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const aiChatLastMessageId = useAtomStateValue(aiChatLastMessageIdSelector);

  const aiChatDisplayedThread = useAiChatDisplayedThreadId();
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
