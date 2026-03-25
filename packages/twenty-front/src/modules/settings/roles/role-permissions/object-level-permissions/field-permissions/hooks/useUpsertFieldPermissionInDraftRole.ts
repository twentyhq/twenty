import { getRoleWithUpsertedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithUpsertedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const useUpsertFieldPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
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
