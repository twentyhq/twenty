import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useGetRolesQuery } from '~/generated-metadata/graphql';
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
      (roles: RoleWithPartialMembers[]) => {
        const roleIds = roles.map((role) => role.id);
        set(settingsRoleIdsState, roleIds);
        roles.forEach((role) => {
          const persistedRole = getSnapshotValue(
            snapshot,
            settingsPersistedRoleFamilyState(role.id),
          );

          const currentDraftRole = getSnapshotValue(
            snapshot,
            settingsDraftRoleFamilyState(role.id),
          );

          if (isDeeplyEqual(role, persistedRole)) {
            return;
          }

          set(settingsPersistedRoleFamilyState(role.id), role);

          if (!isDeeplyEqual(currentDraftRole, role)) {
            set(settingsDraftRoleFamilyState(role.id), role);
          }
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
