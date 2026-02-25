import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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

  const role = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );
  const setActiveTabId = useSetAtomComponentState(
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
