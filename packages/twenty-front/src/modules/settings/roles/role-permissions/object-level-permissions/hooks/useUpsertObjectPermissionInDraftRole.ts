import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/getRoleWithUpsertedObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetRecoilState } from 'recoil';
import { ObjectPermission } from '~/generated/graphql';

export const useUpsertObjectPermissionInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
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
