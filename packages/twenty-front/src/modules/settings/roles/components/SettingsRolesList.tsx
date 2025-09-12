import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { ROLES_LIST_TABS } from '@/settings/roles/constants/RolesListTabs';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import {
  H2Title,
  IconKey,
  IconPlus,
  IconRobot,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { FeatureFlagKey } from '~/generated/graphql';
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
  max-height: 488px;
  overflow-y: auto;
`;

const StyledNoRoles = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRolesList = () => {
  const navigateSettings = useNavigateSettings();
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    ROLES_LIST_TABS.COMPONENT_INSTANCE_ID,
  );

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const sortedSettingsAllRoles = [...settingsAllRoles].sort((a, b) =>
    sortByAscString(a.label, b.label),
  );

  const filteredRoles = sortedSettingsAllRoles.filter((role) => {
    switch (activeTabId) {
      case ROLES_LIST_TABS.TABS_IDS.USER_ROLES:
        return role.canBeAssignedToUsers;
      case ROLES_LIST_TABS.TABS_IDS.AGENT_ROLES:
        return role.canBeAssignedToAgents;
      case ROLES_LIST_TABS.TABS_IDS.API_KEY_ROLES:
        return role.canBeAssignedToApiKeys;
      default:
        return role.canBeAssignedToUsers;
    }
  });

  const tabs = [
    {
      id: ROLES_LIST_TABS.TABS_IDS.USER_ROLES,
      title: t`User Roles`,
      Icon: IconUser,
    },
    ...(isAiEnabled
      ? [
          {
            id: ROLES_LIST_TABS.TABS_IDS.AGENT_ROLES,
            title: t`Agent Roles`,
            Icon: IconRobot,
          },
        ]
      : []),
    {
      id: ROLES_LIST_TABS.TABS_IDS.API_KEY_ROLES,
      title: t`API Key Roles`,
      Icon: IconKey,
    },
  ];

  const description = isAiEnabled
    ? t`Manage roles and permissions for team members, agents, and API keys`
    : t`Manage roles and permissions for team members and API keys`;

  return (
    <Section>
      <H2Title title={t`All roles`} description={description} />

      <TabList
        tabs={tabs}
        className="tab-list"
        componentInstanceId={ROLES_LIST_TABS.COMPONENT_INSTANCE_ID}
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
