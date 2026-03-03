import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/getRoleWithUpsertedObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export const useUpsertObjectPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const upsertObjectPermissionInDraftRole = (
    objectPermissionToUpsert: ObjectPermission,
  ) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithUpsertedObjectPermission(
        currentSettingsDraftRole,
        objectPermissionToUpsert,
      ),
    );
  };

  return {
    upsertObjectPermissionInDraftRole,
  };
};
