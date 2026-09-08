import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { agentChatNonLastMessageIdsComponentSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AiChatNonLastMessageIdsList = () => {
  const agentChatNonLastMessageIds = useAtomComponentSelectorValue(
    agentChatNonLastMessageIdsComponentSelector,
  );

  return agentChatNonLastMessageIds.map((messageId) => (
    <AiChatMessage key={messageId} messageId={messageId} />
  ));
};
