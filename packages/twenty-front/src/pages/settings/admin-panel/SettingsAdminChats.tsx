import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { SettingsAdminChatsFilterDropdown } from '@/settings/admin-panel/chats/components/SettingsAdminChatsFilterDropdown';
import { SettingsAdminChatsTable } from '@/settings/admin-panel/chats/components/SettingsAdminChatsTable';
import { useAdminChatThreads } from '@/settings/admin-panel/chats/hooks/useAdminChatThreads';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledShowMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminChats = () => {
  const {
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
  } = useAdminChatThreads();

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
          {isDefined(error) ? (
            <SettingsEmptyPlaceholder>{t`Failed to load chats. Please try again.`}</SettingsEmptyPlaceholder>
          ) : loading && threads.length === 0 ? (
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
          {hasMore && !isDefined(error) && (
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
