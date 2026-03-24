import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { agentChatNonLastMessageIdsComponentSelector } from '@/ai/states/agentChatNonLastMessageIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AIChatNonLastMessageIdsList = () => {
  const agentChatNonLastMessageIds = useAtomComponentSelectorValue(
    agentChatNonLastMessageIdsComponentSelector,
  );

  return agentChatNonLastMessageIds.map((messageId) => (
    <AIChatMessage key={messageId} messageId={messageId} />
  ));
};
