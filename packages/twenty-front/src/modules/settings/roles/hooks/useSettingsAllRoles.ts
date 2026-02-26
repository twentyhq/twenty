import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSettingsAllRoles = () => {
  // eslint-disable-next-line twenty/matching-state-variable
  const roleIds = useAtomStateValue(settingsRoleIdsState);
  const store = useStore();

  const roles = roleIds
    .map((roleId) =>
      store.get(settingsPersistedRoleFamilyState.atomFamily(roleId)),
    )
    .filter(isDefined);

  return roles;
};
