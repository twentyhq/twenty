import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Role } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleEditEffectProps = {
  roleId: string;
};

export const SettingsRoleEditEffect = ({
  roleId,
}: SettingsRoleEditEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const role = useRecoilValue(settingsPersistedRoleFamilyState(roleId));
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  const updateDraftRoleIfNeeded = useRecoilCallback(
    ({ set, snapshot }) =>
      (newRole: Role) => {
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

    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.ASSIGNMENT);
    updateDraftRoleIfNeeded(role);
    setIsInitialized(true);
  }, [isInitialized, role, setActiveTabId, updateDraftRoleIfNeeded]);

  return <></>;
};
