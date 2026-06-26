import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatStreamLastEventTimestampState } from '@/ai/states/agentChatStreamLastEventTimestampState';
import { agentChatStreamResubscribeNonceState } from '@/ai/states/agentChatStreamResubscribeNonceState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/sse-db-event/constants/SseLivenessCheckIntervalInMs';
import { SSE_LIVENESS_TIMEOUT_IN_MS } from '@/sse-db-event/constants/SseLivenessTimeoutInMs';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatStreamKeepAliveEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isStreamingFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatIsStreamingComponentFamilyState,
  );

  const hasActiveSubscription =
    isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread);

  const recoverStreamIfStreaming = useCallback(() => {
    const isStreaming = store.get(
      isStreamingFamilyCallback({ threadId: currentAiChatThread }),
    );

    if (!isStreaming) {
      return;
    }

    store.set(agentChatStreamLastEventTimestampState.atom, Date.now());
    store.set(agentChatStreamResubscribeNonceState.atom, (nonce) => nonce + 1);
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
  }, [store, isStreamingFamilyCallback, currentAiChatThread]);

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

      if (Date.now() - lastTimestamp <= SSE_LIVENESS_TIMEOUT_IN_MS) {
        return;
      }

      recoverStreamIfStreaming();
    }, SSE_LIVENESS_CHECK_INTERVAL_IN_MS);

    return () => clearInterval(interval);
  }, [hasActiveSubscription, store, recoverStreamIfStreaming]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: recoverStreamIfStreaming,
  });

  return null;
};
