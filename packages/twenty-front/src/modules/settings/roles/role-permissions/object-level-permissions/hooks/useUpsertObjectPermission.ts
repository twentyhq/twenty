import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated/graphql';

export const useUpsertObjectPermission = ({ roleId }: { roleId: string }) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const upsertObjectPermission = (
    objectMetadataItemId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
    value: boolean | null,
  ) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermissionToFind) =>
        objectPermissionToFind.objectMetadataId === objectMetadataItemId,
    );

    const newPermissions = { [permissionKey]: value };

    const isHigherPermission =
      permissionKey === 'canUpdateObjectRecords' ||
      permissionKey === 'canSoftDeleteObjectRecords' ||
      permissionKey === 'canDestroyObjectRecords';

    if (isHigherPermission && value !== false) {
      newPermissions.canReadObjectRecords = value;
    }

    if (permissionKey === 'canReadObjectRecords' && !value) {
      newPermissions.canUpdateObjectRecords = false;
      newPermissions.canSoftDeleteObjectRecords = false;
      newPermissions.canDestroyObjectRecords = false;
    }

    if (!isDefined(existingObjectPermission)) {
      const newObjectPermission = {
        objectMetadataId: objectMetadataItemId,
        ...newPermissions,
      } satisfies ObjectPermission;

      upsertObjectPermissionInDraftRole(newObjectPermission);
    } else {
      const updatedObjectPermission = {
        ...existingObjectPermission,
        ...newPermissions,
      };

      upsertObjectPermissionInDraftRole(updatedObjectPermission);
    }
  };

  return {
    upsertObjectPermission,
  };
};
