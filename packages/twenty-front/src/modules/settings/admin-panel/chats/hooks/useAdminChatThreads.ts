import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { isDefined } from 'twenty-shared/utils';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { DEFAULT_ADMIN_CHATS_FILTER_STATE } from '@/settings/admin-panel/chats/constants/DefaultAdminChatsFilterState';
import { SETTINGS_ADMIN_CHATS_TABLE_ID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableId';
import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { getAdminChatsSortVariables } from '@/settings/admin-panel/chats/utils/getAdminChatsSortVariables';
import { GET_ADMIN_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminChatThreads';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  AdminChatThreadScope,
  type GetAdminChatThreadsQuery,
  type GetAdminChatThreadsQueryVariables,
} from '~/generated-admin/graphql';

const PAGE_SIZE = 25;

export const useAdminChatThreads = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState<AdminChatsFilterState>(
    DEFAULT_ADMIN_CHATS_FILTER_STATE,
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
      scope: filters.onboardingOnly
        ? AdminChatThreadScope.ONBOARDING
        : AdminChatThreadScope.ALL,
      hasErrorOnly: filters.hasErrorOnly,
      userNeverEngagedOnly: filters.userNeverEngagedOnly,
      sortBy,
      sortDirection,
    },
  });

  const threads = data?.getAdminChatThreads.threads ?? [];
  const totalCount = data?.getAdminChatThreads.totalCount ?? 0;
  const hasMore = data?.getAdminChatThreads.hasMore ?? false;

  const handleShowMore = async () => {
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
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    threads,
    totalCount,
    hasMore,
    loading,
    error,
    handleShowMore,
  };
};
