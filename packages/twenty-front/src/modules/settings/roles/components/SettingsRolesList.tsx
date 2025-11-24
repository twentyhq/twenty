import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import {
  H2Title,
  IconFilter,
  IconKey,
  IconPlus,
  IconRobot,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { sortByAscString } from '~/utils/array/sortByAscString';

const StyledCreateRoleSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoRoles = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
`;

export const SettingsRolesList = () => {
  const navigateSettings = useNavigateSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAgentRoles, setShowAgentRoles] = useState(false);
  const [showApiKeyRoles, setShowApiKeyRoles] = useState(false);

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

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
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to specify access permissions`}
      />

      <StyledSearchAndFilterContainer>
        <StyledSearchInput
          instanceId="settings-roles-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a role...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Dropdown
          dropdownId="settings-roles-filter-dropdown"
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <Button
              Icon={IconFilter}
              size="medium"
              variant="secondary"
              accent="default"
              ariaLabel={t`Filter`}
            />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItemToggle
                  LeftIcon={IconRobot}
                  onToggleChange={() => setShowAgentRoles(!showAgentRoles)}
                  toggled={showAgentRoles}
                  text={t`Agent roles`}
                  toggleSize="small"
                />
                <MenuItemToggle
                  LeftIcon={IconKey}
                  onToggleChange={() => setShowApiKeyRoles(!showApiKeyRoles)}
                  toggled={showApiKeyRoles}
                  text={t`API key roles`}
                  toggleSize="small"
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledSearchAndFilterContainer>

      <Table>
        <SettingsRolesTableHeader />
        <StyledTableRows>
          {filteredRoles.length === 0 ? (
            <StyledNoRoles>{t`No roles found`}</StyledNoRoles>
          ) : (
            filteredRoles.map((role) => (
              <SettingsRolesTableRow key={role.id} role={role} />
            ))
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateRoleSection>
        <Button
          Icon={IconPlus}
          title={t`Create Role`}
          variant="secondary"
          size="small"
          onClick={() => navigateSettings(SettingsPath.RoleCreate)}
        />
      </StyledCreateRoleSection>
    </Section>
  );
};
