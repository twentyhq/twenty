import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Role, useGetRolesQuery } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const SettingsRolesQueryEffect = () => {
  const { data, loading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  const setSettingsRolesIsLoading = useSetRecoilState(
    settingsRolesIsLoadingState,
  );

  const populateRoles = useRecoilCallback(
    ({ set, snapshot }) =>
      (roles: Role[]) => {
        const roleIds = roles.map((role) => role.id);
        set(settingsRoleIdsState, roleIds);
        roles.forEach((role) => {
          const persistedRole = getSnapshotValue(
            snapshot,
            settingsPersistedRoleFamilyState(role.id),
          );
          if (!persistedRole || isDeeplyEqual(role, persistedRole)) {
            return;
          }
          set(settingsDraftRoleFamilyState(role.id), role);
          set(settingsPersistedRoleFamilyState(role.id), role);
        });
      },
    [],
  );

  useEffect(() => {
    setSettingsRolesIsLoading(loading);
    if (!loading) {
      const roles = data?.getRoles;
      if (!isDefined(roles)) {
        return;
      }

      populateRoles(roles);
    }
  }, [data, loading, populateRoles, setSettingsRolesIsLoading]);

  return null;
};
