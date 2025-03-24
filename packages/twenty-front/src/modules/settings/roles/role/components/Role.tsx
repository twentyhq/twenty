import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { RoleAssignment } from '@/settings/roles/role-assignment/components/RoleAssignment';
import { RolePermissions } from '@/settings/roles/role-permissions/components/RolePermissions';
import { RoleSettings } from '@/settings/roles/role-settings/components/RoleSettings';
import { RoleLabelContainer } from '@/settings/roles/role/components/RoleLabelContainer';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Button, IconLockOpen, IconSettings, IconUserPlus } from 'twenty-ui';
import {
  FeatureFlagKey,
  useCreateOneRoleMutation,
  useUpdateOneRoleMutation,
} from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SETTINGS_ROLE_DETAIL_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-role-detail-tabs',
  TABS_IDS: {
    ASSIGNMENT: 'assignment',
    PERMISSIONS: 'permissions',
    SETTINGS: 'settings',
  },
} as const;

type RoleProps = {
  roleId: string;
  isCreateMode: boolean;
};

export const Role = ({ roleId, isCreateMode }: RoleProps) => {
  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + `-${roleId}`,
  );

  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  const navigateSettings = useNavigateSettings();

  const [createRole] = useCreateOneRoleMutation();
  const [updateRole] = useUpdateOneRoleMutation();

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const settingsPersistedRole = useRecoilValue(
    settingsPersistedRoleFamilyState(roleId),
  );

  if (!isDefined(settingsDraftRole)) {
    return <></>;
  }

  const isRoleEditable = isPermissionsV2Enabled && settingsDraftRole.isEditable;

  if (!activeTabId) {
    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.SETTINGS);
  }

  const tabs = [
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.ASSIGNMENT,
      title: t`Assignment`,
      Icon: IconUserPlus,
    },
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS,
      title: t`Permissions`,
      Icon: IconLockOpen,
    },
    {
      id: SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
  ];

  const isDirty = !isDeeplyEqual(settingsDraftRole, settingsPersistedRole);

  const handleSave = () => {
    if (isCreateMode) {
      createRole({
        variables: {
          createRoleInput: {
            id: roleId,
            label: settingsDraftRole.label,
            description: settingsDraftRole.description,
            icon: settingsDraftRole.icon,
            canUpdateAllSettings: settingsDraftRole.canUpdateAllSettings,
            canReadAllObjectRecords: settingsDraftRole.canReadAllObjectRecords,
            canUpdateAllObjectRecords:
              settingsDraftRole.canUpdateAllObjectRecords,
            canSoftDeleteAllObjectRecords:
              settingsDraftRole.canSoftDeleteAllObjectRecords,
            canDestroyAllObjectRecords:
              settingsDraftRole.canDestroyAllObjectRecords,
          },
        },
        onCompleted: (data) => {
          navigateSettings(SettingsPath.RoleDetail, {
            roleId: data.createOneRole.id,
          });
        },
      });
    } else {
      updateRole({
        variables: {
          updateRoleInput: {
            id: roleId,
            update: {
              label: settingsDraftRole.label,
              description: settingsDraftRole.description,
              icon: settingsDraftRole.icon,
              canUpdateAllSettings: settingsDraftRole.canUpdateAllSettings,
              canReadAllObjectRecords:
                settingsDraftRole.canReadAllObjectRecords,
              canUpdateAllObjectRecords:
                settingsDraftRole.canUpdateAllObjectRecords,
              canSoftDeleteAllObjectRecords:
                settingsDraftRole.canSoftDeleteAllObjectRecords,
              canDestroyAllObjectRecords:
                settingsDraftRole.canDestroyAllObjectRecords,
            },
          },
        },
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={<RoleLabelContainer roleId={roleId} />}
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
          children: settingsDraftRole.label,
        },
      ]}
      actionButton={
        isDirty && (
          <Button
            title={isCreateMode ? t`Create` : t`Save`}
            variant="primary"
            accent="blue"
            onClick={handleSave}
            disabled={!isRoleEditable}
          />
        )
      }
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          className="tab-list"
          componentInstanceId={
            SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + `-${roleId}`
          }
        />
        {activeTabId === SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.ASSIGNMENT && (
          <RoleAssignment roleId={roleId} />
        )}
        {activeTabId === SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS && (
          <RolePermissions roleId={roleId} isEditable={isRoleEditable} />
        )}
        {activeTabId === SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.SETTINGS && (
          <RoleSettings roleId={roleId} isEditable={isRoleEditable} />
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
