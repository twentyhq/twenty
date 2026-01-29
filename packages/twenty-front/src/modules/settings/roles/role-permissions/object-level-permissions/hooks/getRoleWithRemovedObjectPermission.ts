import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { produce } from 'immer';

export const getRoleWithRemovedObjectPermission = (
  role: RoleWithPartialMembers,
  objectMetadataId: string,
): RoleWithPartialMembers => {
  return produce(role, (draftRole) => {
    draftRole.objectPermissions =
      draftRole.objectPermissions?.filter(
        (permission) => permission.objectMetadataId !== objectMetadataId,
      ) ?? [];
    //! logic for removing fieldPermissions here but not working
    draftRole.fieldPermissions =
      draftRole.fieldPermissions?.filter(
        (permission) => permission.objectMetadataId !== objectMetadataId,
      ) ?? [];

    draftRole.rowLevelPermissionPredicates =
      draftRole.rowLevelPermissionPredicates?.filter(
        (predicate) => predicate.objectMetadataId !== objectMetadataId,
      ) ?? [];

    draftRole.rowLevelPermissionPredicateGroups =
      draftRole.rowLevelPermissionPredicateGroups?.filter(
        (group) => group.objectMetadataId !== objectMetadataId,
      ) ?? [];
  });
};
