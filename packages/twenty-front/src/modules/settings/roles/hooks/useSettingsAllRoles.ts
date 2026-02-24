import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSettingsAllRoles = () => {
  const roleIds = useRecoilValueV2(settingsRoleIdsState);
  const store = useStore();

  const roles = roleIds
    .map((roleId) =>
      store.get(settingsPersistedRoleFamilyState.atomFamily(roleId)),
    )
    .filter(isDefined);

  return roles;
};
