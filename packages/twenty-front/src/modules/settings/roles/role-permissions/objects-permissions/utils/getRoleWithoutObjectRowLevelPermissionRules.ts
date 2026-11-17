import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// Related record paths are edited from the object settings, so they outlive the role page override
export const getRoleWithoutObjectRowLevelPermissionRules = ({
  role,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers;
  objectMetadataId: string;
}): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionPredicates: role.rowLevelPermissionPredicates?.filter(
    (predicate) =>
      predicate.objectMetadataId !== objectMetadataId ||
      isDefined(predicate.relationFieldMetadataId),
  ),
  rowLevelPermissionPredicateGroups:
    role.rowLevelPermissionPredicateGroups?.filter(
      (predicateGroup) => predicateGroup.objectMetadataId !== objectMetadataId,
    ),
});
