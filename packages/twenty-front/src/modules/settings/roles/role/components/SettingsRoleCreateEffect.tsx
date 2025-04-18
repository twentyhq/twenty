import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS);

    const newRole = {
      id: roleId,
      label: '',
      description: '',
      icon: 'IconUser',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isEditable: true,
      workspaceMembers: [],
    };

    setSettingsDraftRole(newRole);
    setIsInitialized(true);
  }, [isInitialized, roleId, setActiveTabId, setSettingsDraftRole]);

  return null;
};
