import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// Related record paths are edited from the object settings, so they and their groups outlive the role page override
export const getRoleWithoutObjectRowLevelPermissionRules = ({
  role,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers;
  objectMetadataId: string;
}): RoleWithPartialMembers => {
  const rowLevelPermissionPredicates =
    role.rowLevelPermissionPredicates?.filter(
      (predicate) =>
        predicate.objectMetadataId !== objectMetadataId ||
        isDefined(predicate.relationFieldMetadataId),
    );

  const predicateGroupById = new Map(
    (role.rowLevelPermissionPredicateGroups ?? []).map((predicateGroup) => [
      predicateGroup.id,
      predicateGroup,
    ]),
  );
  const keptPredicateGroupIds = new Set<string>();

  for (const predicate of rowLevelPermissionPredicates ?? []) {
    let predicateGroupId = predicate.rowLevelPermissionPredicateGroupId;

    while (
      isDefined(predicateGroupId) &&
      !keptPredicateGroupIds.has(predicateGroupId)
    ) {
      keptPredicateGroupIds.add(predicateGroupId);
      predicateGroupId =
        predicateGroupById.get(
          predicateGroupId,
        )?.parentRowLevelPermissionPredicateGroupId;
    }
  }

  return {
    ...role,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups:
      role.rowLevelPermissionPredicateGroups?.filter(
        (predicateGroup) =>
          predicateGroup.objectMetadataId !== objectMetadataId ||
          keptPredicateGroupIds.has(predicateGroup.id),
      ),
  };
};
