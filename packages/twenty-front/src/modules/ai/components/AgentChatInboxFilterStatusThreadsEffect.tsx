import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_INBOX_FILTER_STATUS_INITIAL_RETRY_DELAY_IN_MS } from '@/ai/constants/AgentChatInboxFilterStatusInitialRetryDelayInMs';
import { AGENT_CHAT_INBOX_FILTER_STATUS_MAX_LOAD_ATTEMPTS } from '@/ai/constants/AgentChatInboxFilterStatusMaxLoadAttempts';
import { useRefreshAgentChatThreadsInFilterStatus } from '@/ai/hooks/useRefreshAgentChatThreadsInFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatInboxFilterStatusThreadsEffect = () => {
  const store = useStore();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const isChannelViewShown = isDefined(
    useAtomStateValue(agentChatShownChannelViewSelector),
  );
  const { refreshAgentChatThreadsInFilterStatus } =
    useRefreshAgentChatThreadsInFilterStatus();
  const isListLoaded = isDefined(agentChatThreadList);
  const isFilterStatusLoaded = isDefined(
    agentChatThreadList?.filterStatusPages?.[agentChatThreadFilterStatus],
  );

  useEffect(() => {
    if (!isListLoaded || isFilterStatusLoaded || isChannelViewShown) {
      return;
    }

    let isCancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const loadFirstPage = async ({
      attempt,
      retryDelayInMs,
    }: {
      attempt: number;
      retryDelayInMs: number;
    }) => {
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
        () =>
          void loadFirstPage({
            attempt: attempt + 1,
            retryDelayInMs: retryDelayInMs * 2,
          }),
        retryDelayInMs,
      );
    };

    void loadFirstPage({
      attempt: 1,
      retryDelayInMs: AGENT_CHAT_INBOX_FILTER_STATUS_INITIAL_RETRY_DELAY_IN_MS,
    });

    return () => {
      isCancelled = true;
      clearTimeout(retryTimeout);
    };
  }, [
    agentChatThreadFilterStatus,
    isChannelViewShown,
    isFilterStatusLoaded,
    isListLoaded,
    refreshAgentChatThreadsInFilterStatus,
    store,
  ]);

  return null;
};
