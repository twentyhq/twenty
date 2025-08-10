import { getRoleWithUpsertedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithUpsertedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetRecoilState } from 'recoil';
import { type FieldPermission } from '~/generated/graphql';

export const useUpsertFieldPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
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
