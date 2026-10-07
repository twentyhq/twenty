import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { agentChatNonLastMessageIdsSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatNonLastMessageIdsList = () => {
  const agentChatNonLastMessageIds = useAtomStateValue(
    agentChatNonLastMessageIdsSelector,
  );

  return agentChatNonLastMessageIds.map((messageId) => (
    <AiChatMessage key={messageId} messageId={messageId} />
  ));
};
