import { selector } from 'recoil';
import { settingsPersistedRoleFamilyState } from './settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from './settingsRoleIdsState';

export const settingsAllRolesState = selector({
  key: 'settingsAllRolesState',
  get: ({ get }) => {
    const roleIds = get(settingsRoleIdsState);
    return roleIds.map((roleId) =>
      get(settingsPersistedRoleFamilyState(roleId)),
    );
  },
});
