import styled from '@emotion/styled';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconChevronDown, IconDotsVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { FindAdminApplicationRegistrationInstalledWorkspacesDocument } from '~/generated-admin/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { SettingsPath } from 'twenty-shared/types';

const INITIAL_VISIBLE_WORKSPACES = 3;
const SHOW_MORE_PAGE_SIZE = 20;
const INSTALLED_WORKSPACES_GRID_TEMPLATE_COLUMNS = '1fr 120px';

const StyledSection = styled(Section)`
  margin-top: ${themeCssVariables.spacing[5]};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
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
  const apolloAdminClient = useApolloAdminClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [isExpanded, setIsExpanded] = useState(false);

  const applicationRegistrationId = registration.id;

  const { data, loading, error, fetchMore } = useQuery(
    FindAdminApplicationRegistrationInstalledWorkspacesDocument,
    {
      client: apolloAdminClient,
      variables: {
        input: {
          id: applicationRegistrationId,
          searchTerm: debouncedSearchTerm,
        },
      },
      skip: !applicationRegistrationId,
    },
  );

  const result = data?.findAdminApplicationRegistrationInstalledWorkspaces;
  const workspaces = result?.workspaces ?? [];
  const totalCount = result?.totalCount ?? 0;
  const hasMore = result?.hasMore ?? false;

  const isSearching = debouncedSearchTerm.trim() !== '';

  // Don't render a misleading "no installs" state when the query actually failed
  if (isDefined(error)) {
    return null;
  }

  // The app is installed nowhere (as opposed to a search yielding no matches)
  const hasNoInstalls = totalCount === 0 && !isSearching && !loading;

  if (hasNoInstalls) {
    return null;
  }

  const visibleWorkspaces = isExpanded
    ? workspaces
    : workspaces.slice(0, INITIAL_VISIBLE_WORKSPACES);

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setIsExpanded(false);
  };

  const handleShowMore = () => {
    fetchMore({
      variables: {
        input: {
          id: applicationRegistrationId,
          limit: SHOW_MORE_PAGE_SIZE,
          offset: workspaces.length,
          searchTerm: debouncedSearchTerm,
        },
      },
      updateQuery: (previousData, { fetchMoreResult }) => {
        if (!isDefined(fetchMoreResult)) {
          return previousData;
        }

        return {
          findAdminApplicationRegistrationInstalledWorkspaces: {
            ...fetchMoreResult.findAdminApplicationRegistrationInstalledWorkspaces,
            workspaces: [
              ...previousData
                .findAdminApplicationRegistrationInstalledWorkspaces.workspaces,
              ...fetchMoreResult
                .findAdminApplicationRegistrationInstalledWorkspaces.workspaces,
            ],
          },
        };
      },
    });
  };

  return (
    <StyledSection>
      <StyledSearchInputContainer>
        <SettingsTextInput
          instanceId="installed-workspaces-search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t`Search by workspace name or version...`}
          fullWidth
        />
      </StyledSearchInputContainer>
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : workspaces.length === 0 ? (
        <SettingsEmptyPlaceholder>{t`No workspaces found`}</SettingsEmptyPlaceholder>
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
                to={getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
                  workspaceId: workspace.id,
                })}
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
    </StyledSection>
  );
};
