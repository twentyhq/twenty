import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
      label: t`Role name`,
      description: '',
      icon: 'IconUser',
      canUpdateAllSettings: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isEditable: true,
      workspaceMembers: [],
    };

    setSettingsDraftRole(newRole);
    setIsInitialized(true);
  }, [isInitialized, roleId, setActiveTabId, setSettingsDraftRole]);

  return null;
};
