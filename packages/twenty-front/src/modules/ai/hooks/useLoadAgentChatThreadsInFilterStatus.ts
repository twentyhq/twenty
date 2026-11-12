import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  type AgentChatThreadFilterStatus,
  computeAgentChatThreadFilterStatusGqlFilter,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatThreadsPage } from '@/ai/hooks/useLoadAgentChatThreadsPage';
import { appendAgentChatThreadIds } from '@/ai/utils/appendAgentChatThreadIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

export const useLoadAgentChatThreadsInFilterStatus = () => {
  const store = useStore();
  const { loadAgentChatThreadsPage } = useLoadAgentChatThreadsPage();

  const loadAgentChatThreadsInFilterStatus = useCallback(
    ({
      filterStatus,
      mode,
    }: {
      filterStatus: AgentChatThreadFilterStatus;
      mode: 'first' | 'next';
    }) =>
      loadAgentChatThreadsPage({
        getPageRequest: (list) => {
          const workspaceMemberId = store.get(
            currentWorkspaceMemberState.atom,
          )?.id;
          const filterStatusPage = list?.filterStatusPages?.[filterStatus];

          if (
            !isDefined(list) ||
            !isDefined(workspaceMemberId) ||
            (mode === 'next' && !filterStatusPage?.hasNextPage)
          ) {
            return undefined;
          }

          return {
            lastCursor:
              mode === 'next' ? (filterStatusPage?.endCursor ?? null) : null,
            filter: {
              and: [
                { deletedAt: { is: 'NULL' } },
                computeAgentChatThreadFilterStatusGqlFilter({
                  filterStatus,
                  workspaceMemberId,
                }),
              ],
            },
          };
        },
        buildNextList: ({ list, page }) => ({
          threadIds: list?.threadIds ?? [],
          hasNextPage: list?.hasNextPage ?? false,
          endCursor: list?.endCursor ?? null,
          filterStatusPages: {
            ...list?.filterStatusPages,
            [filterStatus]: {
              threadIds: appendAgentChatThreadIds({
                threadIds:
                  mode === 'next'
                    ? (list?.filterStatusPages?.[filterStatus]?.threadIds ?? [])
                    : [],
                threads: page.threads,
              }),
              hasNextPage: page.hasNextPage,
              endCursor: page.endCursor,
            },
          },
        }),
      }),
    [loadAgentChatThreadsPage, store],
  );

  return { loadAgentChatThreadsInFilterStatus };
};
