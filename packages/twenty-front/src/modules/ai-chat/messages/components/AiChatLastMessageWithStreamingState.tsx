import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatMessage } from '@/ai-chat/messages/components/AiChatMessage';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadIsStreamingFamilySelector';
import { aiChatLastReplyMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatLastReplyMessageIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatLastMessageWithStreamingState = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatLastReplyMessageId = useAtomFamilySelectorValue(
    aiChatLastReplyMessageIdFamilySelector,
    threadId,
  );

  const aiChatThreadIsStreaming = useAtomFamilySelectorValue(
    aiChatThreadIsStreamingFamilySelector,
    { threadId },
  );
  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    {
      threadId,
    },
  );

  if (!isDefined(aiChatLastReplyMessageId)) {
    return null;
  }

  return (
    <AiChatMessage
      messageId={aiChatLastReplyMessageId}
      isLastMessageStreaming={aiChatThreadIsStreaming}
      error={aiChatThreadReplyError ?? undefined}
    />
  );
};
