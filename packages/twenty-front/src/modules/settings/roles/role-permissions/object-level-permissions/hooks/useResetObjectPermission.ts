import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectPermission } from '~/generated/graphql';

const OBJECT_PERMISSION_KEYS: SettingsRoleObjectPermissionKey[] = [
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
];

export const useResetObjectPermission = ({ roleId }: { roleId: string }) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const resetObjectPermission = (objectMetadataItemId: string) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermissionToFind) =>
        objectPermissionToFind.objectMetadataId === objectMetadataItemId,
    );

    const resetPermissions = OBJECT_PERMISSION_KEYS.reduce(
      (acc, permissionKey) => {
        acc[permissionKey] = null;
        return acc;
      },
      {} as Record<SettingsRoleObjectPermissionKey, null>,
    );

    if (!isDefined(existingObjectPermission)) {
      const newObjectPermission = {
        objectMetadataId: objectMetadataItemId,
        ...resetPermissions,
      } satisfies ObjectPermission;

      upsertObjectPermissionInDraftRole(newObjectPermission);
    } else {
      const updatedObjectPermission = {
        ...existingObjectPermission,
        ...resetPermissions,
      };

      upsertObjectPermissionInDraftRole(updatedObjectPermission);
    }
  };

  return {
    resetObjectPermission,
  };
};
