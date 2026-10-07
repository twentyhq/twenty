import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import {
  AgentChatInboxViewKind,
  GetAgentChatInboxThreadIdsDocument,
} from '~/generated-metadata/graphql';

const AGENT_CHAT_CHANNEL_THREADS_PAGE_SIZE = 30;

export const useLoadAgentChatChannelThreads = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { loadAgentChatThreadsByIds } = useRefreshAgentChatThreads();

  const loadAgentChatChannelThreads = useCallback(
    async (mode: 'refresh' | 'fetch-more') => {
      const channelView = store.get(agentChatShownChannelViewSelector.atom);

      if (!isDefined(channelView)) {
        return;
      }

      const viewKey = getAgentChatChannelViewKey(channelView);
      const listBeforeRequest = store.get(agentChatChannelThreadListState.atom);
      const isFetchMore = mode === 'fetch-more';

      if (
        isFetchMore &&
        (listBeforeRequest?.viewKey !== viewKey ||
          !listBeforeRequest.hasNextPage)
      ) {
        return;
      }

      const page = (
        await apolloClient
          .query({
            query: GetAgentChatInboxThreadIdsDocument,
            variables: {
              view: {
                kind: AgentChatInboxViewKind.CHANNEL,
                channelId: channelView.channelId,
                channelStatus: channelView.channelStatus,
                assignment: channelView.assignment,
              },
              first: AGENT_CHAT_CHANNEL_THREADS_PAGE_SIZE,
              after: isFetchMore ? listBeforeRequest?.endCursor : null,
            },
            fetchPolicy: 'network-only',
          })
          .catch(() => undefined)
      )?.data?.agentChatInboxThreadIds;

      if (!isDefined(page)) {
        return;
      }

      // Chats already listed stay current through record events
      const listedThreadIds = new Set(
        store.get(agentChatThreadListState.atom)?.threadIds ?? [],
      );

      await loadAgentChatThreadsByIds(
        page.threadIds.filter((threadId) => !listedThreadIds.has(threadId)),
      );

      const currentChannelView = store.get(
        agentChatShownChannelViewSelector.atom,
      );

      // Another view or page may have replaced the list meanwhile
      if (
        (isFetchMore &&
          store.get(agentChatChannelThreadListState.atom) !==
            listBeforeRequest) ||
        !isDefined(currentChannelView) ||
        getAgentChatChannelViewKey(currentChannelView) !== viewKey
      ) {
        return;
      }

      const previousThreadIds = isFetchMore
        ? (listBeforeRequest?.threadIds ?? [])
        : [];

      store.set(agentChatChannelThreadListState.atom, {
        viewKey,
        threadIds: [
          ...previousThreadIds,
          ...page.threadIds.filter(
            (threadId) => !previousThreadIds.includes(threadId),
          ),
        ],
        hasNextPage: page.hasNextPage,
        endCursor: page.endCursor ?? null,
      });
    },
    [apolloClient, loadAgentChatThreadsByIds, store],
  );

  return { loadAgentChatChannelThreads };
};
