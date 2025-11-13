import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useEffect, useState } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const AgentChatMessagesEffect = ({
  messages,
}: {
  messages: ExtendedUIMessage[];
}) => {
  const { scrollToBottom } = useAgentChatScrollToBottom();
  const [, setPreviousMessages] = useState<ExtendedUIMessage[] | null>(null);

  useEffect(() => {
    setPreviousMessages((currentPreviousMessages) => {
      if (
        currentPreviousMessages !== null &&
        isDeeplyEqual(currentPreviousMessages, messages)
      ) {
        return currentPreviousMessages;
      }

      // We intentionally force this effect because the chat transport streams messages incrementally
      // and the only reliable way to react to those chunks is through useEffect updates.
      scrollToBottom();
      return messages;
    });
  }, [messages, scrollToBottom]);

  return null;
};
