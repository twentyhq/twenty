import { AppChip } from '@/applications/components/AppChip';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext, useState } from 'react';
import { assertUnreachable, getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, IconChevronRight, IconPinned } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
  FindAllApplicationRegistrationsDocument,
} from '~/generated-admin/graphql';

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const TABLE_GRID = '1fr 100px 100px 100px 40px';
const TABLE_GRID_MOBILE = '3fr 3fr 1fr 1fr 40px';

export const SettingsAdminApps = () => {
  const apolloAdminClient = useApolloAdminClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreInstalledOnly, setShowPreInstalledOnly] = useState(false);

  const { data } = useQuery(FindAllApplicationRegistrationsDocument, {
    client: apolloAdminClient,
  });

  const registrations = data?.findAllApplicationRegistrations ?? [];

  const query = searchQuery.trim().toLowerCase();

  const filtered = registrations
    .filter((registration) => {
      if (showPreInstalledOnly && !registration.isPreInstalled) {
        return false;
      }

      if (query.length === 0) {
        return true;
      }

      return (
        registration.name.toLowerCase().includes(query) ||
        (registration.sourcePackage ?? '').toLowerCase().includes(query) ||
        registration.universalIdentifier.toLowerCase().includes(query)
      );
    })
    .toSorted((a, b) => Number(a.isConfigured) - Number(b.isConfigured));

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
            {filtered.map((registration) => (
              <SettingsAdminAppsTableRow
                key={registration.id}
                registration={registration}
                getFormattedSource={getFormattedSource}
              />
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Section>
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
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <AppChip
          size="md"
          fallbackApplicationData={{
            logo: registration.logoUrl,
            name: registration.name,
          }}
        />
      </TableCell>
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
