import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/utils/getRoleWithUpsertedObjectPermission';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithObjectActionPermissions = ({
  role,
  objectMetadataId,
  actionPermissions,
}: {
  role: RoleWithPartialMembers;
  objectMetadataId: string;
  actionPermissions: SettingsRoleObjectActionPermissions;
}): RoleWithPartialMembers => {
  const existingObjectPermission = role.objectPermissions?.find(
    (objectPermission) =>
      objectPermission.objectMetadataId === objectMetadataId,
  );

  return getRoleWithUpsertedObjectPermission(role, {
    ...existingObjectPermission,
    objectMetadataId,
    ...actionPermissions,
  });
};
