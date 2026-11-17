import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatLastMessageIdFamilySelector } from '@/ai/states/selectors/aiChatLastMessageIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatLastMessageId = useAtomFamilySelectorValue(
    aiChatLastMessageIdFamilySelector,
    threadId,
  );

  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
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
