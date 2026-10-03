import { useProcessUIToolCallMessage } from '@/ai/hooks/useProcessUIToolCallMessage';
import { useProcessWorkspaceSetupCompletion } from '@/ai/hooks/useProcessWorkspaceSetupCompletion';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpdateStreamingPartsWithDiff = () => {
  const agentChatUISessionStartTime = useAtomStateValue(
    agentChatUISessionStartTimeState,
  );

  const { processUIToolCallMessage } = useProcessUIToolCallMessage();
  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();

  // messages are replaced, never mutated, so the last one seen can be kept by reference
  const lastSeenMessageByIdRef = useRef(new Map<string, ExtendedUIMessage>());

  const isMessageFromCurrentSession = (message: ExtendedUIMessage) => {
    if (agentChatUISessionStartTime === null) {
      return false;
    }

    const messageCreatedAt = message.metadata?.createdAt;

    return (
      !isNonEmptyString(messageCreatedAt) ||
      Temporal.Instant.from(messageCreatedAt).epochNanoseconds >=
        agentChatUISessionStartTime.epochNanoseconds
    );
  };

  const updateStreamingPartsWithDiff = (
    incomingMessages: ExtendedUIMessage[],
  ) => {
    const lastSeenMessageById = lastSeenMessageByIdRef.current;

    // only the messages on screen are kept, so other threads' messages are released
    lastSeenMessageByIdRef.current = new Map(
      incomingMessages.map((message) => [message.id, message]),
    );

    for (const incomingMessage of incomingMessages) {
      const lastSeenMessage = lastSeenMessageById.get(incomingMessage.id);

      // a stream flush keeps the unchanged messages, a refetch rebuilds them all
      if (
        lastSeenMessage === incomingMessage ||
        isDeeplyEqual(lastSeenMessage, incomingMessage)
      ) {
        continue;
      }

      if (!isMessageFromCurrentSession(incomingMessage)) {
        continue;
      }

      processUIToolCallMessage(incomingMessage);
      processWorkspaceSetupCompletion(incomingMessage);
    }
  };

  return {
    updateStreamingPartsWithDiff,
  };
};
