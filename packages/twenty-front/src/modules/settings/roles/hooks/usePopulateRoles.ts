import { useRecoilCallback } from 'recoil';
import { Role } from '~/generated-metadata/graphql';
import { settingsPersistedRoleFamilyState } from '../states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '../states/settingsRoleIdsState';

export const usePopulateRoles = () => {
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

  return {
    populateRoles,
  };
};
