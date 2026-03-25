import { agentChatIsScrolledToBottomSelector } from '@/ai/states/agentChatIsScrolledToBottomSelector';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { scrollAIChatToBottom } from '@/ai/utils/scrollAIChatToBottom';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

export const AgentChatStreamingAutoScrollEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const agentChatIsScrolledToBottom = useAtomStateValue(
    agentChatIsScrolledToBottomSelector,
  );

  useEffect(() => {
    if (agentChatMessages.length === 0) {
      return;
    }

    if (agentChatIsScrolledToBottom) {
      scrollAIChatToBottom();
    }
  }, [agentChatMessages, agentChatIsScrolledToBottom]);

  return null;
};
