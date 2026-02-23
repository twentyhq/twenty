import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingStateV2 } from '@/settings/roles/states/settingsRolesIsLoadingStateV2';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useGetRolesQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const SettingsRolesQueryEffect = () => {
  const { data, loading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  const setSettingsRolesIsLoading = useSetRecoilStateV2(
    settingsRolesIsLoadingStateV2,
  );

  const store = useStore();

  const populateRoles = useCallback(
    (roles: RoleWithPartialMembers[]) => {
      const roleIds = roles.map((role) => role.id);
      store.set(settingsRoleIdsState.atom, roleIds);
      roles.forEach((role) => {
        const persistedRole = store.get(
          settingsPersistedRoleFamilyState.atomFamily(role.id),
        );

        const currentDraftRole = store.get(
          settingsDraftRoleFamilyState.atomFamily(role.id),
        );

        if (isDeeplyEqual(role, persistedRole)) {
          return;
        }

        store.set(settingsPersistedRoleFamilyState.atomFamily(role.id), role);

        if (!isDeeplyEqual(currentDraftRole, role)) {
          store.set(settingsDraftRoleFamilyState.atomFamily(role.id), role);
        }
      });
    },
    [store],
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
