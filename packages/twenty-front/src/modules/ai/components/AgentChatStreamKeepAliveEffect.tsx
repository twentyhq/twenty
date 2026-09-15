import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai/constants/AgentChatStreamLivenessCheckIntervalInMs';
import { AGENT_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS } from '@/ai/constants/AgentChatStreamLivenessTimeoutInMs';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatStreamLastEventTimestampState } from '@/ai/states/agentChatStreamLastEventTimestampState';
import { agentChatStreamRecoveryAttemptsState } from '@/ai/states/agentChatStreamRecoveryAttemptsState';
import { agentChatStreamResubscribeNonceState } from '@/ai/states/agentChatStreamResubscribeNonceState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const MAX_SILENT_RECOVERY_ATTEMPTS = 3;

export const AgentChatStreamKeepAliveEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isStreamingFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatIsStreamingComponentFamilyState,
  );
  const isAwaitingFirstChunkFamilyCallback =
    useAtomComponentFamilyStateCallbackState(
      agentChatIsAwaitingFirstChunkComponentFamilyState,
    );
  const errorFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatErrorComponentFamilyState,
  );

  const hasActiveSubscription =
    isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread);

  const recoverStreamIfStalled = useCallback(() => {
    const familyKey = { threadId: currentAiChatThread };
    const isStreaming = store.get(isStreamingFamilyCallback(familyKey));
    const isAwaitingFirstChunk = store.get(
      isAwaitingFirstChunkFamilyCallback(familyKey),
    );

    if (!isStreaming && !isAwaitingFirstChunk) {
      store.set(agentChatStreamRecoveryAttemptsState.atom, 0);

      return;
    }

    const recoveryAttempts = store.get(
      agentChatStreamRecoveryAttemptsState.atom,
    );

    if (recoveryAttempts >= MAX_SILENT_RECOVERY_ATTEMPTS) {
      store.set(
        errorFamilyCallback(familyKey),
        createAiChatCodedError(
          'Connection to the assistant was lost. Reload to see the response.',
          AiChatErrorCode.CONNECTION_LOST,
        ),
      );
      store.set(isStreamingFamilyCallback(familyKey), false);
      store.set(isAwaitingFirstChunkFamilyCallback(familyKey), false);
      store.set(agentChatStreamRecoveryAttemptsState.atom, 0);
      store.set(agentChatStreamLastEventTimestampState.atom, Date.now());

      return;
    }

    store.set(
      agentChatStreamRecoveryAttemptsState.atom,
      (attempts) => attempts + 1,
    );
    store.set(agentChatStreamLastEventTimestampState.atom, Date.now());
    store.set(agentChatStreamResubscribeNonceState.atom, (nonce) => nonce + 1);
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
  }, [
    store,
    isStreamingFamilyCallback,
    isAwaitingFirstChunkFamilyCallback,
    errorFamilyCallback,
    currentAiChatThread,
  ]);

  useEffect(() => {
    if (!hasActiveSubscription) {
      return;
    }

    const interval = setInterval(() => {
      const lastTimestamp = store.get(
        agentChatStreamLastEventTimestampState.atom,
      );

      if (!isDefined(lastTimestamp)) {
        return;
      }

      const timeSinceLastEventInMs = Date.now() - lastTimestamp;

      if (timeSinceLastEventInMs <= AGENT_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS) {
        store.set(agentChatStreamRecoveryAttemptsState.atom, 0);

        const errorAtom = errorFamilyCallback({
          threadId: currentAiChatThread,
        });
        const currentError = store.get(errorAtom);

        if (
          isDefined(currentError) &&
          isGraphqlErrorOfType(currentError, AiChatErrorCode.CONNECTION_LOST)
        ) {
          store.set(errorAtom, null);
        }

        return;
      }

      recoverStreamIfStalled();
    }, AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS);

    return () => clearInterval(interval);
  }, [
    hasActiveSubscription,
    store,
    recoverStreamIfStalled,
    errorFamilyCallback,
    currentAiChatThread,
  ]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: recoverStreamIfStalled,
  });

  return null;
};
