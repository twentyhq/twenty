import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsRoleCreateEffectProps = {
  roleId: string;
};

export const SettingsRoleCreateEffect = ({
  roleId,
}: SettingsRoleCreateEffectProps) => {
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const setSettingsPersistedRole = useSetRecoilState(
    settingsPersistedRoleFamilyState(roleId),
  );

  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + '-' + roleId,
  );

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS);

    const newRole = {
      id: roleId,
      label: t`Untitled role`,
      description: '',
      icon: 'IconUser',
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isEditable: true,
      workspaceMembers: [],
    };

    setSettingsPersistedRole(undefined);
    setSettingsDraftRole(newRole);
    setIsInitialized(true);
  }, [
    isInitialized,
    roleId,
    setActiveTabId,
    setSettingsDraftRole,
    setSettingsPersistedRole,
  ]);

  return null;
};
