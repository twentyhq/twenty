import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSettingsAllRoles = () => {
  const roleIds = useAtomValue(settingsRoleIdsState);
  const store = useStore();

  const roles = roleIds
    .map((roleId) =>
      store.get(settingsPersistedRoleFamilyState.atomFamily(roleId)),
    )
    .filter(isDefined);

  return roles;
};
