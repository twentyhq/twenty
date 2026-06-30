import styled from '@emotion/styled';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconChevronDown, IconDotsVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  type ApplicationRegistration,
  FindApplicationRegistrationInstalledWorkspacesDocument,
} from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const INITIAL_VISIBLE_WORKSPACES = 3;
const INSTALLED_WORKSPACES_GRID_TEMPLATE_COLUMNS = '1fr 120px';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationInstalledWorkspaces = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const applicationRegistrationId = registration.id;

  const { data, loading, fetchMore } = useQuery(
    FindApplicationRegistrationInstalledWorkspacesDocument,
    {
      variables: {
        id: applicationRegistrationId,
        page: 1,
        searchTerm: debouncedSearchTerm,
      },
      skip: !applicationRegistrationId,
    },
  );

  const result = data?.findApplicationRegistrationInstalledWorkspaces;
  const workspaces = result?.workspaces ?? [];
  const totalCount = result?.totalCount ?? 0;
  const hasMore = result?.hasMore ?? false;

  const isSearching = debouncedSearchTerm.trim() !== '';

  // Hide the whole section when the app has no installs at all (and no active search)
  if (totalCount === 0 && !isSearching && !loading) {
    return null;
  }

  const visibleWorkspaces = isExpanded
    ? workspaces
    : workspaces.slice(0, INITIAL_VISIBLE_WORKSPACES);

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setCurrentPage(1);
    setIsExpanded(false);
  };

  const handleShowMore = () => {
    const nextPage = currentPage + 1;

    fetchMore({
      variables: {
        id: applicationRegistrationId,
        page: nextPage,
        searchTerm: debouncedSearchTerm,
      },
      updateQuery: (previousData, { fetchMoreResult }) => {
        if (!isDefined(fetchMoreResult)) {
          return previousData;
        }

        return {
          findApplicationRegistrationInstalledWorkspaces: {
            ...fetchMoreResult.findApplicationRegistrationInstalledWorkspaces,
            workspaces: [
              ...previousData.findApplicationRegistrationInstalledWorkspaces
                .workspaces,
              ...fetchMoreResult.findApplicationRegistrationInstalledWorkspaces
                .workspaces,
            ],
          },
        };
      },
    });

    setCurrentPage(nextPage);
  };

  return (
    <Section>
      <H2Title
        title={t`Installed workspaces`}
        description={t`Workspaces that have installed this app`}
      />
      <StyledSearchInputContainer>
        <SettingsTextInput
          instanceId="installed-workspaces-search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t`Search by workspace name...`}
          fullWidth
        />
      </StyledSearchInputContainer>
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : totalCount === 0 ? (
        <StyledEmptyState>
          {t`No workspaces found matching your search criteria.`}
        </StyledEmptyState>
      ) : (
        <Table>
          <TableRow
            gridTemplateColumns={INSTALLED_WORKSPACES_GRID_TEMPLATE_COLUMNS}
          >
            <TableHeader>{t`Workspace`}</TableHeader>
            <TableHeader align="right">{t`Version installed`}</TableHeader>
          </TableRow>
          <TableBody>
            {visibleWorkspaces.map((workspace) => (
              <TableRow
                key={workspace.id}
                gridTemplateColumns={INSTALLED_WORKSPACES_GRID_TEMPLATE_COLUMNS}
              >
                <TableCell
                  color={themeCssVariables.font.color.primary}
                  gap={themeCssVariables.spacing[2]}
                  overflow="hidden"
                >
                  <Avatar
                    avatarUrl={getAbsoluteImageUrl(workspace.logo ?? undefined)}
                    placeholder={workspace.displayName ?? '—'}
                    placeholderColorSeed={workspace.id}
                    size="md"
                  />
                  <OverflowingTextWithTooltip
                    text={workspace.displayName ?? '—'}
                  />
                </TableCell>
                <TableCell
                  align="right"
                  color={themeCssVariables.font.color.tertiary}
                >
                  {workspace.version ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!isExpanded && totalCount > INITIAL_VISIBLE_WORKSPACES && (
        <StyledButtonContainer>
          <Button
            title={t`Show all`}
            Icon={IconChevronDown}
            variant="secondary"
            size="small"
            onClick={() => setIsExpanded(true)}
          />
        </StyledButtonContainer>
      )}
      {isExpanded && hasMore && (
        <StyledButtonContainer>
          <Button
            title={t`Show more`}
            Icon={IconDotsVertical}
            variant="secondary"
            size="small"
            onClick={handleShowMore}
          />
        </StyledButtonContainer>
      )}
    </Section>
  );
};
