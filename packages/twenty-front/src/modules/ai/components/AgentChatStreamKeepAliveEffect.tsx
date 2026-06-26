import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { agentChatStreamLastEventTimestampState } from '@/ai/states/agentChatStreamLastEventTimestampState';
import { agentChatStreamResubscribeNonceState } from '@/ai/states/agentChatStreamResubscribeNonceState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { SSE_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/sse-db-event/constants/SseLivenessCheckIntervalInMs';
import { SSE_LIVENESS_TIMEOUT_IN_MS } from '@/sse-db-event/constants/SseLivenessTimeoutInMs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatStreamKeepAliveEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const hasActiveSubscription =
    isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread);

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

      store.set(agentChatStreamLastEventTimestampState.atom, Date.now());
      store.set(
        agentChatStreamResubscribeNonceState.atom,
        (nonce) => nonce + 1,
      );
      dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
    }, SSE_LIVENESS_CHECK_INTERVAL_IN_MS);

    return () => clearInterval(interval);
  }, [hasActiveSubscription, store]);

  return null;
};
