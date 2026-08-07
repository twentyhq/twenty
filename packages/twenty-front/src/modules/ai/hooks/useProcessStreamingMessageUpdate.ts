import { useProcessUIToolCallMessage } from '@/ai/hooks/useProcessUIToolCallMessage';
import { useProcessWorkspaceSetupCompletion } from '@/ai/hooks/useProcessWorkspaceSetupCompletion';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { isCompleteWorkspaceSetupToolPart } from '@/ai/utils/isCompleteWorkspaceSetupToolPart';
import { isUIToolCallMessage } from '@/ai/utils/isUIToolCallMessage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const useProcessStreamingMessageUpdate = () => {
  const agentChatUISessionStartTime = useAtomStateValue(
    agentChatUISessionStartTimeState,
  );

  const { processUIToolCallMessage } = useProcessUIToolCallMessage();

  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();

  const processStreamingMessageUpdate = (
    streamingMessage: ExtendedUIMessage,
  ) => {
    if (agentChatUISessionStartTime === null) {
      return false;
    }

    const messageCreatedAt = streamingMessage.metadata?.createdAt;

    if (isNonEmptyString(messageCreatedAt)) {
      const messageCreatedAtInstant = Temporal.Instant.from(messageCreatedAt);

      const messageIsAfterChatSessionStart =
        messageCreatedAtInstant.epochNanoseconds >=
        agentChatUISessionStartTime.epochNanoseconds;

      if (!messageIsAfterChatSessionStart) {
        return false;
      }
    }

    const messageIsUIToolCall = isUIToolCallMessage(streamingMessage);

    if (messageIsUIToolCall) {
      processUIToolCallMessage(streamingMessage);
    }

    const messageCompletesWorkspaceSetup = streamingMessage.parts.some(
      isCompleteWorkspaceSetupToolPart,
    );

    if (messageCompletesWorkspaceSetup) {
      processWorkspaceSetupCompletion(streamingMessage);
    }
  };

  return {
    processStreamingMessageUpdate,
  };
};
