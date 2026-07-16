import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  assertUnreachable,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import {
  IconChevronRight,
  IconDotsVertical,
  IconPinned,
  IconRefresh,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
  FindAllApplicationRegistrationsDocument,
  SyncMarketplaceCatalogDocument,
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

const TABLE_GRID = '1fr 100px 100px 100px 40px';
const TABLE_GRID_MOBILE = '3fr 3fr 1fr 1fr 40px';
const PAGE_SIZE = 25;

export const SettingsAdminApps = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [showPreInstalledOnly, setShowPreInstalledOnly] = useState(false);

  const { data, loading, fetchMore } = useQuery(
    FindAllApplicationRegistrationsDocument,
    {
      client: apolloAdminClient,
      notifyOnNetworkStatusChange: true,
      variables: {
        limit: PAGE_SIZE,
        offset: 0,
        searchTerm: debouncedSearchQuery,
        isPreInstalledOnly: showPreInstalledOnly,
      },
    },
  );

  const [syncMarketplaceCatalog, { loading: isSyncing }] = useMutation(
    SyncMarketplaceCatalogDocument,
    { client: apolloAdminClient },
  );

  const handleSyncCatalog = async () => {
    try {
      await syncMarketplaceCatalog();
      enqueueSuccessSnackBar({
        message: t`Marketplace catalog synchronization started.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to synchronize the marketplace catalog.`,
      });
    }
  };

  const registrations = [
    ...(data?.findAllApplicationRegistrations.registrations ?? []),
  ].sort((a, b) => Number(a.isConfigured) - Number(b.isConfigured));

  const hasMore = data?.findAllApplicationRegistrations.hasMore ?? false;

  const handleShowMore = () => {
    fetchMore({
      variables: {
        limit: PAGE_SIZE,
        offset: registrations.length,
      },
      updateQuery: (previousData, { fetchMoreResult }) => {
        if (!isDefined(fetchMoreResult)) {
          return previousData;
        }

        return {
          findAllApplicationRegistrations: {
            ...fetchMoreResult.findAllApplicationRegistrations,
            registrations: [
              ...previousData.findAllApplicationRegistrations.registrations,
              ...fetchMoreResult.findAllApplicationRegistrations.registrations,
            ],
          },
        };
      },
    });
  };

  const getFormattedSource = (
    registration: ApplicationRegistrationFragmentFragment,
  ) => {
    switch (registration.sourceType) {
      case ApplicationRegistrationSourceType.TARBALL: {
        return 'Tarball';
      }
      case ApplicationRegistrationSourceType.NPM: {
        return 'NPM';
      }
      case ApplicationRegistrationSourceType.OAUTH_ONLY: {
        return 'OAuth';
      }
      case ApplicationRegistrationSourceType.LOCAL: {
        return 'Local';
      }
      default:
        return assertUnreachable(registration.sourceType);
    }
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`General`}
          description={t`Manage the marketplace application catalog`}
        />
        <Button
          Icon={IconRefresh}
          title={t`Synchronize catalog`}
          size="small"
          variant="secondary"
          onClick={handleSyncCatalog}
          isLoading={isSyncing}
          disabled={isSyncing}
        />
      </Section>
      <Section>
        <H2Title
          title={t`All App Registrations`}
          description={t`All application registrations across the platform, including orphaned marketplace apps`}
        />
        <SearchInput
          placeholder={t`Search registrations...`}
          value={searchQuery}
          onChange={setSearchQuery}
          filterDropdown={(filterButton: ReactNode) => (
            <Dropdown
              dropdownId="settings-admin-apps-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconPinned}
                      onToggleChange={() =>
                        setShowPreInstalledOnly(!showPreInstalledOnly)
                      }
                      toggled={showPreInstalledOnly}
                      text={t`Pre-installed only`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
        {loading && registrations.length === 0 ? (
          <SettingsEmptyPlaceholder>{t`Loading apps...`}</SettingsEmptyPlaceholder>
        ) : registrations.length === 0 ? (
          <SettingsEmptyPlaceholder>{t`No apps found`}</SettingsEmptyPlaceholder>
        ) : (
          <StyledTableContainer>
            <Table>
              <TableRow
                gridAutoColumns={TABLE_GRID}
                mobileGridAutoColumns={TABLE_GRID_MOBILE}
              >
                <TableHeader>{t`Name`}</TableHeader>
                <TableHeader align="right">{t`Source`}</TableHeader>
                <TableHeader align="right">{t`Listed`}</TableHeader>
                <TableHeader align="right">{t`Configured`}</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <TableBody>
                {registrations.map((registration) => (
                  <SettingsAdminAppsTableRow
                    key={registration.id}
                    registration={registration}
                    getFormattedSource={getFormattedSource}
                  />
                ))}
              </TableBody>
            </Table>
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
    </>
  );
};

type SettingsAdminAppsTableRowProps = {
  registration: ApplicationRegistrationFragmentFragment;
  getFormattedSource: (
    registration: ApplicationRegistrationFragmentFragment,
  ) => string;
};

const SettingsAdminAppsTableRow = ({
  registration,
  getFormattedSource,
}: SettingsAdminAppsTableRowProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TableRow
      to={getSettingsPath(
        SettingsPath.AdminPanelApplicationRegistrationDetail,
        { applicationRegistrationId: registration.id },
      )}
      gridAutoColumns={TABLE_GRID}
      mobileGridAutoColumns={TABLE_GRID_MOBILE}
      isClickable
    >
      <StyledNameTableCell minWidth="0" overflow="hidden">
        <ApplicationDisplay
          application={{
            name: registration.name,
            logo: registration.logoUrl,
          }}
        />
      </StyledNameTableCell>
      <TableCell overflow="hidden" align="right">
        {getFormattedSource(registration)}
      </TableCell>
      <TableCell align="right">
        {registration.isListed ? t`Yes` : t`No`}
      </TableCell>
      <TableCell align="right">
        <Tag
          color={registration.isConfigured ? 'green' : 'red'}
          text={registration.isConfigured ? t`Yes` : t`No`}
        />
      </TableCell>
      <TableCell align="right">
        <IconChevronRight
          size={theme.icon.size.md}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </TableRow>
  );
};
