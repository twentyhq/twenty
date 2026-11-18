import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

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

  const isRemovedPredicateGroupId = (
    predicateGroupId: string | null | undefined,
  ) =>
    isDefined(predicateGroupId) &&
    predicateGroupById.get(predicateGroupId)?.objectMetadataId ===
      objectMetadataId &&
    !keptPredicateGroupIds.has(predicateGroupId);

  return {
    ...role,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups:
      role.rowLevelPermissionPredicateGroups?.filter(
        (predicateGroup) => !isRemovedPredicateGroupId(predicateGroup.id),
      ),
    fieldPermissions: role.fieldPermissions?.filter(
      (fieldPermission) =>
        !isRemovedPredicateGroupId(
          fieldPermission.rowLevelPermissionPredicateGroupId,
        ),
    ),
  };
};
