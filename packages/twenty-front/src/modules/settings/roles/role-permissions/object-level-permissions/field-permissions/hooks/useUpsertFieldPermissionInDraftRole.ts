import { getRoleWithUpsertedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithUpsertedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetFamilyAtomState } from '@/ui/utilities/state/jotai/hooks/useSetFamilyAtomState';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const useUpsertFieldPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetFamilyAtomState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const upsertFieldPermissionInDraftRole = (
    fieldPermissionToUpsert: FieldPermission,
  ) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithUpsertedFieldPermission(
        currentSettingsDraftRole,
        fieldPermissionToUpsert,
      ),
    );
  };

  return {
    upsertFieldPermissionInDraftRole,
  };
};
