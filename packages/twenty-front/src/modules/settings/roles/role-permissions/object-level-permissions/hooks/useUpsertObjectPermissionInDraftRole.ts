import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/getRoleWithUpsertedObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetFamilyAtomState } from '@/ui/utilities/state/jotai/hooks/useSetFamilyAtomState';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export const useUpsertObjectPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetFamilyAtomState(
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
