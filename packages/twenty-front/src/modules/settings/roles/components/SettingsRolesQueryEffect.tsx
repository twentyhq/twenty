import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Role, useGetRolesQuery } from '~/generated/graphql';

export const SettingsRolesQueryEffect = () => {
  const { data, loading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  const setSettingsRolesIsLoading = useSetRecoilState(
    settingsRolesIsLoadingState,
  );

  const populateRoles = useRecoilCallback(
    ({ set }) =>
      (roles: Role[]) => {
        const roleIds = roles.map((role) => role.id);
        set(settingsRoleIdsState, roleIds);
        roles.forEach((role) => {
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
