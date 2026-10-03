import { useProcessUIToolCallMessage } from '@/ai/hooks/useProcessUIToolCallMessage';
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

  const { processUIToolCallMessage } = useProcessUIToolCallMessage();
  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();

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
    for (const incomingMessage of incomingMessages) {
      if (
        isDeeplyEqual(
          lastSeenMessageById.get(incomingMessage.id),
          incomingMessage,
        )
      ) {
        continue;
      }

      lastSeenMessageById.set(
        incomingMessage.id,
        structuredClone(incomingMessage),
      );

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
