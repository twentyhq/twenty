import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { Section, SettingsRow } from 'twenty-ui/components';
import {
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

const StyledCreateRoleSectionContainer = styled.div`
  > * {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    display: flex;
    justify-content: flex-end;
    padding-bottom: ${themeCssVariables.spacing[2]};
    padding-top: ${themeCssVariables.spacing[2]};
  }
`;

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

  const settingsAllRoles = useSettingsAllRoles();

  const sortedSettingsAllRoles = [...settingsAllRoles].sort((a, b) =>
    sortByAscString(a.label, b.label),
  );

  const filteredRoles = sortedSettingsAllRoles.filter((role) => {
    const matchesType =
      role.canBeAssignedToUsers ||
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
        <Dropdown
          dropdownId="settings-roles-filter-dropdown"
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <Button
              startIcon={<IconFilter />}
              size="md"
              aria-label={t`Filter`}
              variant="outline"
            />
          }
          dropdownComponents={
            <LegacyDropdownContent>
              <DropdownMenuItemsContainer>
                <SettingsRow
                  startIcon={<IconLego />}
                  onCheckedChange={() => setShowAgentRoles(!showAgentRoles)}
                  checked={showAgentRoles}
                >{t`Agent roles`}</SettingsRow>
                <SettingsRow
                  startIcon={<IconKey />}
                  onCheckedChange={() => setShowApiKeyRoles(!showApiKeyRoles)}
                  checked={showApiKeyRoles}
                >{t`API key roles`}</SettingsRow>
              </DropdownMenuItemsContainer>
            </LegacyDropdownContent>
          }
        />
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
      <StyledCreateRoleSectionContainer>
        <Section.Root>
          <Button
            startIcon={<IconPlus />}
            size="sm"
            onClick={() => navigateSettings(SettingsPath.RoleCreate)}
            variant="outline"
          >{t`Create Role`}</Button>
        </Section.Root>
      </StyledCreateRoleSectionContainer>
    </Section.Root>
  );
};
