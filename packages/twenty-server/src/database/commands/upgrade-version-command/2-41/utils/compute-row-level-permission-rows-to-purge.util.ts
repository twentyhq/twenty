import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

type ComputeRowLevelPermissionRowsToPurgeArgs = {
  flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
};

type ComputeRowLevelPermissionRowsToPurgeReturnType = {
  groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
  predicatesToDelete: FlatRowLevelPermissionPredicate[];
};

export const computeRowLevelPermissionRowsToPurge = ({
  flatRowLevelPermissionPredicateGroupMaps,
  flatRowLevelPermissionPredicateMaps,
}: ComputeRowLevelPermissionRowsToPurgeArgs): ComputeRowLevelPermissionRowsToPurgeReturnType => {
  const flatGroups = Object.values(
    flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const flatPredicates = Object.values(
    flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const groupIdsToDelete = new Set(
    flatGroups
      .filter((group) => isDefined(group.deletedAt))
      .map((group) => group.id),
  );

  let hasFoundNestedGroup = true;

  while (hasFoundNestedGroup) {
    hasFoundNestedGroup = false;

    for (const group of flatGroups) {
      if (
        !groupIdsToDelete.has(group.id) &&
        isDefined(group.parentRowLevelPermissionPredicateGroupId) &&
        groupIdsToDelete.has(group.parentRowLevelPermissionPredicateGroupId)
      ) {
        groupIdsToDelete.add(group.id);
        hasFoundNestedGroup = true;
      }
    }
  }

  return {
    groupsToDelete: flatGroups.filter((group) =>
      groupIdsToDelete.has(group.id),
    ),
    predicatesToDelete: flatPredicates.filter(
      (predicate) =>
        isDefined(predicate.deletedAt) ||
        (isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
          groupIdsToDelete.has(predicate.rowLevelPermissionPredicateGroupId)),
    ),
  };
};
