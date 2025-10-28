import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleEditEffectProps = {
  roleId: string;
};

export const SettingsRoleEditEffect = ({
  roleId,
}: SettingsRoleEditEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const role = useRecoilValue(settingsPersistedRoleFamilyState(roleId));
  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + '-' + roleId,
  );

  const updateDraftRoleIfNeeded = useRecoilCallback(
    ({ set, snapshot }) =>
      (newRole: RoleWithPartialMembers) => {
        const currentPersistedRole = getSnapshotValue(
          snapshot,
          settingsPersistedRoleFamilyState(newRole.id),
        );

        if (!isDeeplyEqual(newRole, currentPersistedRole)) {
          set(settingsDraftRoleFamilyState(newRole.id), newRole);
        }
      },
    [],
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
