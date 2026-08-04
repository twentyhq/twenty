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
import { SettingsAdminChatsContent } from '@/settings/admin-panel/chats/components/SettingsAdminChatsContent';
import { SettingsAdminChatsFilterDropdown } from '@/settings/admin-panel/chats/components/SettingsAdminChatsFilterDropdown';
import { useAdminChatThreads } from '@/settings/admin-panel/chats/hooks/useAdminChatThreads';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

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
          <SettingsAdminChatsContent
            threads={threads}
            showOnboardingTag={!filters.onboardingOnly}
            loading={loading}
            error={error}
          />
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
