import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithRemovedRecordLevelPermissionRules = (
  role: RoleWithPartialMembers,
  objectMetadataId: string,
): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionPredicates: role.rowLevelPermissionPredicates?.filter(
    (predicate) => predicate.objectMetadataId !== objectMetadataId,
  ),
  rowLevelPermissionPredicateGroups:
    role.rowLevelPermissionPredicateGroups?.filter(
      (predicateGroup) => predicateGroup.objectMetadataId !== objectMetadataId,
    ),
});
