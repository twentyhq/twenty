import { agentChatIsScrolledToBottomSelector } from '@/ai/states/agentChatIsScrolledToBottomSelector';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

export const AgentChatStreamingAutoScrollEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsScrolledToBottom = useAtomStateValue(
    agentChatIsScrolledToBottomSelector,
  );

  useEffect(() => {
    if (agentChatMessages.length === 0) {
      return;
    }

    if (agentChatIsScrolledToBottom) {
      scrollAiChatToBottom();
    }
  }, [agentChatMessages, agentChatIsScrolledToBottom]);

  return null;
};
