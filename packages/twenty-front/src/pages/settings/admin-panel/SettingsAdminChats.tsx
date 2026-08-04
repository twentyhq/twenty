import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminChatsFilterDropdown } from '@/settings/admin-panel/chats/components/SettingsAdminChatsFilterDropdown';
import { SettingsAdminChatsTable } from '@/settings/admin-panel/chats/components/SettingsAdminChatsTable';
import { DEFAULT_ADMIN_CHATS_FILTER_STATE } from '@/settings/admin-panel/chats/constants/DefaultAdminChatsFilterState';
import { SETTINGS_ADMIN_CHATS_TABLE_ID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableId';
import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { getAdminChatsSortVariables } from '@/settings/admin-panel/chats/utils/getAdminChatsSortVariables';
import { GET_ADMIN_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminChatThreads';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  AdminChatThreadScope,
  type GetAdminChatThreadsQuery,
  type GetAdminChatThreadsQueryVariables,
} from '~/generated-admin/graphql';

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledShowMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const PAGE_SIZE = 25;

export const SettingsAdminChats = () => {
  const apolloAdminClient = useApolloAdminClient();
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

  const { data, loading, fetchMore } = useQuery<
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

  const handleShowMore = () => {
    fetchMore({
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
  };

  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - AI`,
          href: AI_ADMIN_PATH,
        },
        {
          children: t`Chats`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Chats`}
            description={t`Browse AI chat threads across all workspaces (${totalCount} matching)`}
          />
          <SearchInput
            placeholder={t`Search by workspace, user email or thread id...`}
            value={searchQuery}
            onChange={setSearchQuery}
            filterDropdown={(filterButton: ReactNode) => (
              <SettingsAdminChatsFilterDropdown
                filterButton={filterButton}
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}
          />
          {loading && threads.length === 0 ? (
            <SettingsEmptyPlaceholder>{t`Loading chats...`}</SettingsEmptyPlaceholder>
          ) : threads.length === 0 ? (
            <SettingsEmptyPlaceholder>{t`No chats found`}</SettingsEmptyPlaceholder>
          ) : (
            <StyledTableContainer>
              <SettingsAdminChatsTable
                threads={threads}
                showOnboardingTag={!filters.onboardingOnly}
              />
            </StyledTableContainer>
          )}
          {hasMore && (
            <StyledShowMoreContainer>
              <Button
                title={t`Show more`}
                Icon={IconDotsVertical}
                onClick={handleShowMore}
                disabled={loading}
                size="small"
                variant="secondary"
              />
            </StyledShowMoreContainer>
          )}
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
