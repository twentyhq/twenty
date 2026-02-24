import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleEditEffectProps = {
  roleId: string;
};

export const SettingsRoleEditEffect = ({
  roleId,
}: SettingsRoleEditEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const role = useFamilyRecoilValueV2(settingsPersistedRoleFamilyState, roleId);
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + '-' + roleId,
  );

  const store = useStore();

  const updateDraftRoleIfNeeded = useCallback(
    (newRole: RoleWithPartialMembers) => {
      const currentPersistedRole = store.get(
        settingsPersistedRoleFamilyState.atomFamily(newRole.id),
      );

      if (!isDeeplyEqual(newRole, currentPersistedRole)) {
        store.set(settingsDraftRoleFamilyState.atomFamily(newRole.id), newRole);
      }
    },
    [store],
  );

  useEffect(() => {
    if (isInitialized || !isDefined(role)) {
      return;
    }

    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS);
    updateDraftRoleIfNeeded(role);
    setIsInitialized(true);
  }, [isInitialized, role, setActiveTabId, updateDraftRoleIfNeeded]);

  return <></>;
};
