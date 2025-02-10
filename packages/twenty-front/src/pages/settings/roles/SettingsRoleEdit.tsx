import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  H3Title,
  IconLockOpen,
  IconSettings,
  IconUser,
  IconUserPlus,
} from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useGetRolesQuery } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { RolePermissions } from '~/pages/settings/roles/components/RolePermissions';
import { RoleSettings } from '~/pages/settings/roles/components/RoleSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { RoleAssignment } from './components/RoleAssignment';

const StyledContentContainer = styled.div`
  flex: 1;
  width: 100%;
  padding-left: 0;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconUser = styled(IconUser)`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const SETTINGS_ROLE_DETAIL_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-role-detail-tabs',
  TABS_IDS: {
    ASSIGNMENT: 'assignment',
    PERMISSIONS: 'permissions',
    SETTINGS: 'settings',
  },
} as const;

export const SettingsRoleEdit = () => {
  const { roleId = '' } = useParams();
  const navigateSettings = useNavigateSettings();
  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  const role = rolesData?.getRoles.find((r) => r.id === roleId);

  const { activeTabId } = useTabList(
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  useEffect(() => {
    if (!rolesLoading && !role) {
      navigateSettings(SettingsPath.Roles);
    }
  }, [role, navigateSettings, rolesLoading]);

  if (!role) return null;

  const tabs = [
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.ASSIGNMENT,
      title: t`Assignment`,
      Icon: IconUserPlus,
      hide: false,
    },
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS,
      title: t`Permissions`,
      Icon: IconLockOpen,
      hide: false,
    },
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
      hide: false,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.ASSIGNMENT:
        return <RoleAssignment role={role} />;
      case SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS:
        return <RolePermissions role={role} />;
      case SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.SETTINGS:
        return <RoleSettings role={role} />;
      default:
        return null;
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={
          <StyledTitleContainer>
            <StyledIconUser size={16} />
            <H3Title title={role.label} />
          </StyledTitleContainer>
        }
        links={[
          {
            children: 'Workspace',
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: 'Roles',
            href: getSettingsPath(SettingsPath.Roles),
          },
          {
            children: role.label,
          },
        ]}
      >
        <SettingsPageContainer>
          <TabList
            tabListInstanceId={SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID}
            tabs={tabs}
            className="tab-list"
          />
          <StyledContentContainer>
            {renderActiveTabContent()}
          </StyledContentContainer>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
