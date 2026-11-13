import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatNonLastMessageIdsSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatNonLastMessageIdsList = () => {
  const aiChatNonLastMessageIds = useAtomStateValue(
    aiChatNonLastMessageIdsSelector,
  );

  return aiChatNonLastMessageIds.map((messageId) => (
    <AiChatMessage key={messageId} messageId={messageId} />
  ));
};
