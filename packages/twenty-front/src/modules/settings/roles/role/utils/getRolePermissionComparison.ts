import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

const omitPermissionMetadata = <
  TPermission extends { id: string; roleId: string; __typename?: string },
>({
  id: _id,
  roleId: _roleId,
  __typename: _typename,
  ...permission
}: TPermission) => permission;
const omitRowMetadata = <
  TPermission extends { roleId: string; __typename?: string },
>({
  roleId: _roleId,
  __typename: _typename,
  ...permission
}: TPermission) => permission;

export const getRolePermissionComparison = (role: RoleWithPartialMembers) => ({
  permissionFlags: role.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
  objectPermissions:
    role.objectPermissions
      ?.map(
        ({
          objectMetadataId,
          canReadObjectRecords,
          canUpdateObjectRecords,
          canSoftDeleteObjectRecords,
          canDestroyObjectRecords,
        }) => ({
          objectMetadataId,
          canReadObjectRecords,
          canUpdateObjectRecords,
          canSoftDeleteObjectRecords,
          canDestroyObjectRecords,
        }),
      )
      .sort((first, second) =>
        first.objectMetadataId.localeCompare(second.objectMetadataId),
      ) ?? [],
  fieldPermissions:
    role.fieldPermissions
      ?.filter(
        ({ canReadFieldValue, canUpdateFieldValue }) =>
          canReadFieldValue === false || canUpdateFieldValue === false,
      )
      .map(omitPermissionMetadata)
      .sort((first, second) =>
        first.fieldMetadataId.localeCompare(second.fieldMetadataId),
      ) ?? [],
  rowLevelPermissionPredicates:
    role.rowLevelPermissionPredicates
      ?.map(omitRowMetadata)
      .sort((first, second) => first.id.localeCompare(second.id)) ?? [],
  rowLevelPermissionPredicateGroups:
    role.rowLevelPermissionPredicateGroups
      ?.map(omitRowMetadata)
      .sort((first, second) => first.id.localeCompare(second.id)) ?? [],
});
