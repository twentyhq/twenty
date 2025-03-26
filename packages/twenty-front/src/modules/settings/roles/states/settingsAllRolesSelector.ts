import { selector } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { settingsPersistedRoleFamilyState } from './settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from './settingsRoleIdsState';

export const settingsAllRolesSelector = selector({
  key: 'settingsAllRolesSelector',
  get: ({ get }) => {
    const roleIds = get(settingsRoleIdsState);
    return roleIds
      .map((roleId) => get(settingsPersistedRoleFamilyState(roleId)))
      .filter(isDefined);
  },
});
