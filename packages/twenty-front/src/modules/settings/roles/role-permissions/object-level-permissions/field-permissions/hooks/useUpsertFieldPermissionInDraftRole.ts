import { getRoleWithUpsertedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithUpsertedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const useUpsertFieldPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetFamilyRecoilStateV2(
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
