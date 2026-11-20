import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatMessage } from '@/ai-chat/messages/components/AiChatMessage';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { aiChatLastReplyMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatLastReplyMessageIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatLastReplyMessageId = useAtomFamilySelectorValue(
    aiChatLastReplyMessageIdFamilySelector,
    threadId,
  );

  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });

  if (!isDefined(aiChatLastReplyMessageId)) {
    return null;
  }

  return (
    <AiChatMessage
      messageId={aiChatLastReplyMessageId}
      isLastMessageStreaming={aiChatIsStreaming}
      error={aiChatError ?? undefined}
    />
  );
};
