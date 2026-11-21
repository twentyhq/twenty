import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatMessage } from '@/ai-chat/messages/components/AiChatMessage';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatReplyStatusFamilyState } from '@/ai-chat/states/aiChatReplyStatusFamilyState';
import { aiChatLastReplyMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatLastReplyMessageIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatLastReplyMessageId = useAtomFamilySelectorValue(
    aiChatLastReplyMessageIdFamilySelector,
    threadId,
  );

  const aiChatReplyStatus = useAtomFamilyStateValue(
    aiChatReplyStatusFamilyState,
    { threadId },
  );
  const isAiChatStreaming = aiChatReplyStatus === 'streaming';
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });

  if (!isDefined(aiChatLastReplyMessageId)) {
    return null;
  }

  return (
    <AiChatMessage
      messageId={aiChatLastReplyMessageId}
      isLastMessageStreaming={isAiChatStreaming}
      error={aiChatError ?? undefined}
    />
  );
};
