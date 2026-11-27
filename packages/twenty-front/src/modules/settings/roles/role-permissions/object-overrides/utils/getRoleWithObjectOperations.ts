import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithUpsertedObjectPermission';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithObjectOperations = ({
  role,
  objectMetadataId,
  operations,
}: {
  role: RoleWithPartialMembers;
  objectMetadataId: string;
  operations: SettingsRoleObjectPermissionKey[];
}): RoleWithPartialMembers =>
  getRoleWithUpsertedObjectPermission(role, {
    ...role.objectPermissions?.find(
      (objectPermission) =>
        objectPermission.objectMetadataId === objectMetadataId,
    ),
    objectMetadataId,
    canReadObjectRecords: operations.includes('canReadObjectRecords'),
    canUpdateObjectRecords: operations.includes('canUpdateObjectRecords'),
    canSoftDeleteObjectRecords: operations.includes(
      'canSoftDeleteObjectRecords',
    ),
    canDestroyObjectRecords: operations.includes('canDestroyObjectRecords'),
  });
