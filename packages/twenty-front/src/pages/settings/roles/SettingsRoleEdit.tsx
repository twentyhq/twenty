import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { H3Title, IconLockOpen, IconSettings, IconUserPlus } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { RoleAssignment } from '@/settings/roles/role-assignment/components/RoleAssignment';
import { RolePermissions } from '@/settings/roles/role-permissions/components/RolePermissions';
import { RoleSettings } from '@/settings/roles/role-settings/components/RoleSettings';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetRolesQuery } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  useEffect(() => {
    if (!rolesLoading && !role) {
      navigateSettings(SettingsPath.Roles);
    }
  }, [role, navigateSettings, rolesLoading]);

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
    if (!role) {
      return null;
    }

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
    <SubMenuTopBarContainer
      title={role && <H3Title title={role.label} />}
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
          children: role?.label,
        },
      ]}
    >
      {!rolesLoading && role ? (
        <SettingsPageContainer>
          <TabList
            tabs={tabs}
            className="tab-list"
            componentInstanceId={
              SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID
            }
          />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      ) : (
        <></>
      )}
    </SubMenuTopBarContainer>
  );
};
