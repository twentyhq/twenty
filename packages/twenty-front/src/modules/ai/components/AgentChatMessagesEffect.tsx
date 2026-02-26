import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useProcessIncrementalStreamMessages } from '@/ai/hooks/useProcessIncrementalStreamMessages';
import { useEffect } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const AgentChatMessagesEffect = ({
  incrementalStreamMessages,
}: {
  incrementalStreamMessages: ExtendedUIMessage[];
}) => {
  // console.log(
  //   'last incrementalStreamMessages message:',
  //   JSON.stringify(
  //     incrementalStreamMessages[incrementalStreamMessages.length - 1],
  //     null,
  //     2,
  //   ),
  // );
  const { scrollToBottom, isNearBottom } = useAgentChatScrollToBottom();

  const { processIncrementalStreamMessages } =
    useProcessIncrementalStreamMessages();

  useEffect(() => {
    if (incrementalStreamMessages.length === 0) {
      return;
    }

    if (isNearBottom) {
      scrollToBottom();
    }

    processIncrementalStreamMessages(incrementalStreamMessages);
  }, [
    incrementalStreamMessages,
    scrollToBottom,
    isNearBottom,
    processIncrementalStreamMessages,
  ]);

  return null;
};
