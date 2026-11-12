import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_INBOX_FILTER_STATUS_INITIAL_RETRY_DELAY_IN_MS } from '@/ai/constants/AgentChatInboxFilterStatusInitialRetryDelayInMs';
import { AGENT_CHAT_INBOX_FILTER_STATUS_MAX_LOAD_ATTEMPTS } from '@/ai/constants/AgentChatInboxFilterStatusMaxLoadAttempts';
import { useRefreshAgentChatThreadsInFilterStatus } from '@/ai/hooks/useRefreshAgentChatThreadsInFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Also runs after a refresh, which replaces the list along with its tab pages
export const AgentChatInboxFilterStatusThreadsEffect = () => {
  const store = useStore();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { refreshAgentChatThreadsInFilterStatus } =
    useRefreshAgentChatThreadsInFilterStatus();
  const isListLoaded = isDefined(agentChatThreadList);
  const isFilterStatusLoaded = isDefined(
    agentChatThreadList?.filterStatusPages?.[agentChatThreadFilterStatus],
  );

  useEffect(() => {
    if (!isListLoaded || isFilterStatusLoaded) {
      return;
    }

    let isCancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    // A failed or twice-raced first page would otherwise leave the tab without pages
    const loadFirstPage = async (attempt: number, retryDelayInMs: number) => {
      await refreshAgentChatThreadsInFilterStatus(agentChatThreadFilterStatus);

      if (
        isCancelled ||
        attempt >= AGENT_CHAT_INBOX_FILTER_STATUS_MAX_LOAD_ATTEMPTS ||
        isDefined(
          store.get(agentChatThreadListState.atom)?.filterStatusPages?.[
            agentChatThreadFilterStatus
          ],
        )
      ) {
        return;
      }

      retryTimeout = setTimeout(
        () => void loadFirstPage(attempt + 1, retryDelayInMs * 2),
        retryDelayInMs,
      );
    };

    void loadFirstPage(
      1,
      AGENT_CHAT_INBOX_FILTER_STATUS_INITIAL_RETRY_DELAY_IN_MS,
    );

    return () => {
      isCancelled = true;
      clearTimeout(retryTimeout);
    };
  }, [
    agentChatThreadFilterStatus,
    isFilterStatusLoaded,
    isListLoaded,
    refreshAgentChatThreadsInFilterStatus,
    store,
  ]);

  return null;
};
