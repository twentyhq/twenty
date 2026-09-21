import { isDefined } from 'twenty-shared/utils';

type PurgeableRow = {
  id: string;
  deletedAt?: string | Date | null;
};

type PurgeableGroup = PurgeableRow & {
  parentRowLevelPermissionPredicateGroupId?: string | null;
};

type PurgeablePredicate = PurgeableRow & {
  rowLevelPermissionPredicateGroupId?: string | null;
};

type RowsByUniversalIdentifier<TRow> = {
  byUniversalIdentifier: Partial<Record<string, TRow>>;
};

export const computeRowLevelPermissionRowsToPurge = <
  TGroup extends PurgeableGroup,
  TPredicate extends PurgeablePredicate,
>({
  flatRowLevelPermissionPredicateGroupMaps,
  flatRowLevelPermissionPredicateMaps,
}: {
  flatRowLevelPermissionPredicateGroupMaps: RowsByUniversalIdentifier<TGroup>;
  flatRowLevelPermissionPredicateMaps: RowsByUniversalIdentifier<TPredicate>;
}): {
  groupsToDelete: TGroup[];
  predicatesToDelete: TPredicate[];
} => {
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
