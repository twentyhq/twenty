import { useProcessWorkspaceSetupCompletion } from '@/ai/hooks/useProcessWorkspaceSetupCompletion';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpdateStreamingPartsWithDiff = () => {
  const agentChatUISessionStartTime = useAtomStateValue(
    agentChatUISessionStartTimeState,
  );

  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();

  // messages are replaced, never mutated, so the last one seen can be kept by reference
  const [lastSeenMessageById] = useState(
    () => new Map<string, ExtendedUIMessage>(),
  );

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
    const lastSeenMessages = incomingMessages.map((message) =>
      lastSeenMessageById.get(message.id),
    );

    // only the messages on screen are kept, so other threads' messages are released
    lastSeenMessageById.clear();

    for (const message of incomingMessages) {
      lastSeenMessageById.set(message.id, message);
    }

    for (const [index, incomingMessage] of incomingMessages.entries()) {
      const lastSeenMessage = lastSeenMessages[index];

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

      processWorkspaceSetupCompletion(incomingMessage);
    }
  };

  return {
    updateStreamingPartsWithDiff,
  };
};
