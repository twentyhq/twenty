/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isPredicateInsideOrGroup = ({
  predicate,
  predicateGroupById,
}: {
  predicate: RowLevelPermissionPredicate;
  predicateGroupById: Map<string, RowLevelPermissionPredicateGroup>;
}): boolean => {
  let groupId = predicate.rowLevelPermissionPredicateGroupId;
  const visitedGroupIds = new Set<string>();

  while (isDefined(groupId) && !visitedGroupIds.has(groupId)) {
    visitedGroupIds.add(groupId);

    const group = predicateGroupById.get(groupId);

    if (!isDefined(group)) {
      return true;
    }

    if (
      group.logicalOperator ===
      RowLevelPermissionPredicateGroupLogicalOperator.OR
    ) {
      return true;
    }

    groupId = group.parentRowLevelPermissionPredicateGroupId;
  }

  return false;
};

export const getUnconditionalRowLevelPermissionPredicates = ({
  predicates,
  predicateGroups,
}: {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): RowLevelPermissionPredicate[] => {
  const predicateGroupById = new Map(
    predicateGroups.map((group) => [group.id, group]),
  );

  return predicates.filter(
    (predicate) => !isPredicateInsideOrGroup({ predicate, predicateGroupById }),
  );
};
