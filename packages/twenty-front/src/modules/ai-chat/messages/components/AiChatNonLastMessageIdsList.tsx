import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatMessage } from '@/ai-chat/messages/components/AiChatMessage';
import { aiChatNonLastMessageIdsFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatNonLastMessageIdsFamilySelector';

export const AiChatNonLastMessageIdsList = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatNonLastMessageIds = useAtomFamilySelectorValue(
    aiChatNonLastMessageIdsFamilySelector,
    threadId,
  );

  return aiChatNonLastMessageIds.map((messageId) => (
    <AiChatMessage key={messageId} messageId={messageId} />
  ));
};
