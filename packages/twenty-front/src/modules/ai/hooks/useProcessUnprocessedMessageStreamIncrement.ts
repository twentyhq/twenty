import { useProcessUIToolCallMessage } from '@/ai/hooks/useProcessUIToolCallMessage';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { isUIToolCallMessage } from '@/ai/utils/isUIToolCallMessage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const useProcessUnprocessedMessageStreamIncrement = () => {
  const agentChatUISessionStartTime = useAtomStateValue(
    agentChatUISessionStartTimeState,
  );

  const { processUIToolCallMessage } = useProcessUIToolCallMessage();

  const processUnprocessedMessageStreamIncrement = (
    messageStreamIncrement: ExtendedUIMessage,
  ) => {
    // console.log(
    //   'Processing message stream increment:',
    //   JSON.stringify(messageStreamIncrement, null, 2),
    // );
    if (agentChatUISessionStartTime === null) {
      return false;
    }

    const messageCreatedAt = messageStreamIncrement.metadata?.createdAt;

    if (isNonEmptyString(messageCreatedAt)) {
      const messageCreatedAtInstant = Temporal.Instant.from(messageCreatedAt);

      const messageIsAfterChatSessionStart =
        messageCreatedAtInstant.epochNanoseconds >=
        agentChatUISessionStartTime.epochNanoseconds;

      // console.log(
      //   'Message created at:',
      //   messageCreatedAtInstant.toString(),
      //   'Agent chat UI session start time:',
      //   agentChatUISessionStartTime.toString(),
      //   'Message is after chat session start:',
      //   messageIsAfterChatSessionStart,
      // );

      if (!messageIsAfterChatSessionStart) {
        return false;
      }
    }

    const messageIsUIToolCall = isUIToolCallMessage(messageStreamIncrement);

    // console.log(
    //   JSON.stringify({
    //     messageStreamIncrement,
    //     messageIsUIToolCall,
    //   }),
    // );

    if (messageIsUIToolCall) {
      processUIToolCallMessage(messageStreamIncrement);
    }
  };

  return {
    processUnprocessedMessageStreamIncrement,
  };
};
