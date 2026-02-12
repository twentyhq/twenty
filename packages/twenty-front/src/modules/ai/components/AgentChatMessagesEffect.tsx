import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useEffect, useState } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const AgentChatMessagesEffect = ({
  messages,
}: {
  messages: ExtendedUIMessage[];
}) => {
  const { scrollToBottom, isNearBottom } = useAgentChatScrollToBottom();
  const [, setPreviousMessages] = useState<ExtendedUIMessage[] | null>(null);

  useEffect(() => {
    setPreviousMessages((previousMessages) => {
      if (
        previousMessages !== null &&
        isDeeplyEqual(previousMessages, messages)
      ) {
        return previousMessages;
      }

      // We intentionally force this effect because the chat transport streams messages incrementally
      // and the only reliable way to react to those chunks is through useEffect updates.

      const isNewMessage =
        previousMessages === null ||
        messages.length !== previousMessages.length;

      if (isNewMessage || isNearBottom) {
        scrollToBottom();
      }

      return messages;
    });
  }, [messages, scrollToBottom, isNearBottom]);

  return null;
};
