import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsRow } from 'twenty-ui/components/settings';
import {
  IconApps,
  IconFilter,
  IconKey,
  IconLego,
  IconPlus,
  IconSearch,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { sortByAscString } from '~/utils/array/sortByAscString';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSearchInputContainer = styled.div`
  flex: 1;
`;

export const SettingsRolesList = () => {
  const navigateSettings = useNavigateSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAgentRoles, setShowAgentRoles] = useState(false);
  const [showApiKeyRoles, setShowApiKeyRoles] = useState(false);
  const [showApplicationRoles, setShowApplicationRoles] = useState(false);

  const settingsAllRoles = useSettingsAllRoles();
  const installedApplications = useInstalledApplications();

  const installedApplicationByDefaultRoleId = new Map(
    installedApplications
      .filter((application) => isDefined(application.defaultRoleId))
      .map((application) => [application.defaultRoleId, application]),
  );

  // Admin is the standard application's default role but stays a member role
  const isApplicationRole = (role: RoleWithPartialMembers) =>
    !role.canBeAssignedToUsers &&
    installedApplicationByDefaultRoleId.has(role.id);

  const getApplicationName = (role: RoleWithPartialMembers) =>
    isApplicationRole(role)
      ? (installedApplicationByDefaultRoleId.get(role.id)?.name ?? '')
      : '';

  const sortedSettingsAllRoles = [...settingsAllRoles].sort(
    (a, b) =>
      sortByAscString(getApplicationName(a), getApplicationName(b)) ||
      sortByAscString(a.label, b.label),
  );

  const filteredRoles = sortedSettingsAllRoles.filter((role) => {
    const matchesType = isApplicationRole(role)
      ? showApplicationRoles
      : role.canBeAssignedToUsers ||
        (showAgentRoles && role.canBeAssignedToAgents) ||
        (showApiKeyRoles && role.canBeAssignedToApiKeys);

    const matchesSearch = role.label
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <Section.Root>
      <Section.Header
        title={t`All roles`}
        description={t`Assign roles to specify access permissions`}
      />

      <StyledSearchAndFilterContainer>
        <StyledSearchInputContainer>
          <SettingsTextInput
            instanceId="settings-roles-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a role...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </StyledSearchInputContainer>
        <DropdownRoot dropdownId="settings-roles-filter-dropdown" type="panel">
          <Dropdown.Trigger
            render={
              <Button
                startIcon={<IconFilter />}
                size="md"
                aria-label={t`Filter`}
                variant="outline"
              />
            }
          />
          <DropdownContent align="end" sideOffset={8}>
            <Dropdown.Section>
              <SettingsRow
                startElement={<IconLego />}
                onCheckedChange={() => setShowAgentRoles(!showAgentRoles)}
                checked={showAgentRoles}
              >{t`Agent roles`}</SettingsRow>
              <SettingsRow
                startElement={<IconKey />}
                onCheckedChange={() => setShowApiKeyRoles(!showApiKeyRoles)}
                checked={showApiKeyRoles}
              >{t`API key roles`}</SettingsRow>
              <SettingsRow
                startElement={<IconApps />}
                onCheckedChange={() =>
                  setShowApplicationRoles(!showApplicationRoles)
                }
                checked={showApplicationRoles}
              >{t`Application roles`}</SettingsRow>
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      </StyledSearchAndFilterContainer>

      <Table>
        <SettingsRolesTableHeader />
        <StyledTableRows>
          {filteredRoles.length === 0 ? (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No roles found`}
            </TableCell>
          ) : (
            filteredRoles.map((role) => (
              <SettingsRolesTableRow key={role.id} role={role} />
            ))
          )}
        </StyledTableRows>
      </Table>
      <TableFooter>
        <Button
          startIcon={<IconPlus />}
          size="sm"
          onClick={() => navigateSettings(SettingsPath.RoleCreate)}
          variant="outline"
        >{t`Create Role`}</Button>
      </TableFooter>
    </Section.Root>
  );
};
