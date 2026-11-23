import { isFieldPermissionRestrictive } from '@/settings/roles/role-permissions/field-permissions/utils/isFieldPermissionRestrictive';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const hasObjectFieldRestriction = ({
  role,
  objectMetadataId,
}: {
  role: Pick<RoleWithPartialMembers, 'fieldPermissions'>;
  objectMetadataId: string;
}) =>
  (role.fieldPermissions ?? []).some(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === objectMetadataId &&
      isFieldPermissionRestrictive(fieldPermission),
  );
