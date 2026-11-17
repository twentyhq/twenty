import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatNonLastMessageIdsComponentSelector } from '@/ai/states/selectors/aiChatNonLastMessageIdsComponentSelector';

export const AiChatNonLastMessageIdsList = () => {
  const aiChatNonLastMessageIds = useAtomComponentSelectorValue(
    aiChatNonLastMessageIdsComponentSelector,
  );

  return aiChatNonLastMessageIds.map((messageId) => (
    <AiChatMessage key={messageId} messageId={messageId} />
  ));
};
