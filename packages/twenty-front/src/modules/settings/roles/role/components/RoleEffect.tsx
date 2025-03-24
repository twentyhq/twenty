import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type RoleEffectProps = {
  roleId: string;
};

export const RoleEffect = ({ roleId }: RoleEffectProps) => {
  const [initialLoading, setInitialLoading] = useState(true);

  const setSettingsDraftRole = useRecoilCallback(
    ({ set, snapshot }) =>
      (roleId: string) => {
        const role = getSnapshotValue(
          snapshot,
          settingsPersistedRoleFamilyState(roleId),
        );

        const settingsDraftRole = getSnapshotValue(
          snapshot,
          settingsDraftRoleFamilyState(roleId),
        );

        if (!isDeeplyEqual(settingsDraftRole, role)) {
          set(settingsDraftRoleFamilyState(roleId), role);
        }
      },
    [],
  );

  useEffect(() => {
    setSettingsDraftRole(roleId);
    setInitialLoading(false);
  }, [roleId, setSettingsDraftRole, initialLoading]);

  return <></>;
};
