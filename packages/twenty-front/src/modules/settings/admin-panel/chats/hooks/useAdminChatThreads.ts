import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useDebounce } from 'use-debounce';

import { isDefined } from 'twenty-shared/utils';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SETTINGS_ADMIN_CHATS_TABLE_ID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableId';
import { adminChatsFilterState } from '@/settings/admin-panel/chats/states/adminChatsFilterState';
import { adminChatsSearchQueryState } from '@/settings/admin-panel/chats/states/adminChatsSearchQueryState';
import { getAdminChatsSortVariables } from '@/settings/admin-panel/chats/utils/getAdminChatsSortVariables';
import { GET_ADMIN_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminChatThreads';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  AdminChatThreadScope,
  type GetAdminChatThreadsQuery,
  type GetAdminChatThreadsQueryVariables,
} from '~/generated-admin/graphql';

const PAGE_SIZE = 25;

export const useAdminChatThreads = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [adminChatsSearchQuery, setAdminChatsSearchQuery] = useAtomState(
    adminChatsSearchQueryState,
  );
  const [debouncedSearchQuery] = useDebounce(adminChatsSearchQuery, 300);
  const [adminChatsFilter, setAdminChatsFilter] = useAtomState(
    adminChatsFilterState,
  );

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    {
      tableId: SETTINGS_ADMIN_CHATS_TABLE_ID,
    },
  );
  const { sortBy, sortDirection } =
    getAdminChatsSortVariables(sortedFieldByTable);

  const { data, loading, error, fetchMore } = useQuery<
    GetAdminChatThreadsQuery,
    GetAdminChatThreadsQueryVariables
  >(GET_ADMIN_CHAT_THREADS, {
    client: apolloAdminClient,
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: PAGE_SIZE,
      offset: 0,
      searchTerm: debouncedSearchQuery,
      scope: adminChatsFilter.onboardingOnly
        ? AdminChatThreadScope.ONBOARDING
        : AdminChatThreadScope.ALL,
      hasErrorOnly: adminChatsFilter.hasErrorOnly,
      userNeverEngagedOnly: adminChatsFilter.userNeverEngagedOnly,
      sortBy,
      sortDirection,
    },
  });

  const threads = data?.getAdminChatThreads.threads ?? [];
  const totalCount = data?.getAdminChatThreads.totalCount ?? 0;
  const hasMore = data?.getAdminChatThreads.hasMore ?? false;

  const isShowMoreDisabled =
    loading || adminChatsSearchQuery !== debouncedSearchQuery;

  const handleShowMore = async () => {
    if (isShowMoreDisabled) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          limit: PAGE_SIZE,
          offset: threads.length,
        },
        updateQuery: (previousData, { fetchMoreResult }) => {
          if (!isDefined(fetchMoreResult)) {
            return previousData;
          }

          const previousThreadIds = new Set(
            previousData.getAdminChatThreads.threads.map((thread) => thread.id),
          );

          return {
            getAdminChatThreads: {
              ...fetchMoreResult.getAdminChatThreads,
              threads: [
                ...previousData.getAdminChatThreads.threads,
                ...fetchMoreResult.getAdminChatThreads.threads.filter(
                  (thread) => !previousThreadIds.has(thread.id),
                ),
              ],
            },
          };
        },
      });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to load more chats.` });
    }
  };

  return {
    searchQuery: adminChatsSearchQuery,
    setSearchQuery: setAdminChatsSearchQuery,
    filters: adminChatsFilter,
    setFilters: setAdminChatsFilter,
    threads,
    totalCount,
    hasMore,
    loading,
    isShowMoreDisabled,
    error,
    handleShowMore,
  };
};
