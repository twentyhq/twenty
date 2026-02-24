import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/getRoleWithUpsertedObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export const useUpsertObjectPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetFamilyRecoilStateV2(
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
