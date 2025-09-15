import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { ROLES_LIST_TABS } from '@/settings/roles/constants/RolesListTabs';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useState } from 'react';

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

const StyledSearchInput = styled(SettingsTextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsRolesList = () => {
  const navigateSettings = useNavigateSettings();
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    ROLES_LIST_TABS.COMPONENT_INSTANCE_ID,
  );

  const [searchTerm, setSearchTerm] = useState('');

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const sortedSettingsAllRoles = [...settingsAllRoles].sort((a, b) =>
    sortByAscString(a.label, b.label),
  );

  const filteredRoles = sortedSettingsAllRoles.filter((role) => {
    let matchesTab = false;

    switch (activeTabId) {
      case ROLES_LIST_TABS.TABS_IDS.USER_ROLES:
        matchesTab = role.canBeAssignedToUsers;
        break;
      case ROLES_LIST_TABS.TABS_IDS.AGENT_ROLES:
        matchesTab = role.canBeAssignedToAgents;
        break;
      case ROLES_LIST_TABS.TABS_IDS.API_KEY_ROLES:
        matchesTab = role.canBeAssignedToApiKeys;
        break;
      default:
        matchesTab = role.canBeAssignedToUsers;
    }

    return (
      matchesTab && role.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const tabDescriptions: Record<string, string> = {
    [ROLES_LIST_TABS.TABS_IDS.USER_ROLES]:
      t`Assign roles to specify each member's access permissions`,
    [ROLES_LIST_TABS.TABS_IDS.AGENT_ROLES]:
      t`Assign roles to specify each agent's access permissions`,
    [ROLES_LIST_TABS.TABS_IDS.API_KEY_ROLES]:
      t`Assign roles to specify each API key's access permissions`,
  };

  const description =
    (activeTabId && tabDescriptions[activeTabId]) ??
    t`Assign roles to specify each member's access permissions`;

  return (
    <Section>
      <H2Title title={t`All roles`} description={description} />

      <StyledSearchInput
        instanceId="settings-objects-search"
        LeftIcon={IconSearch}
        placeholder={t`Search a role...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />

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
