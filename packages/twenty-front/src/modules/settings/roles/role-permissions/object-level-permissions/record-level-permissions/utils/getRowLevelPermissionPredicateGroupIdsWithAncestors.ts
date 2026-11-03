import { isDefined } from 'twenty-shared/utils';

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from '~/generated-metadata/graphql';

export const getRowLevelPermissionPredicateGroupIdsWithAncestors = ({
  predicates,
  predicateGroups,
}: {
  predicates: Pick<
    RowLevelPermissionPredicate,
    'rowLevelPermissionPredicateGroupId'
  >[];
  predicateGroups: Pick<
    RowLevelPermissionPredicateGroup,
    'id' | 'parentRowLevelPermissionPredicateGroupId'
  >[];
}): Set<string> => {
  const predicateGroupById = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.id,
      predicateGroup,
    ]),
  );

  const groupIds = new Set<string>();

  for (const predicate of predicates) {
    let groupId: string | null | undefined =
      predicate.rowLevelPermissionPredicateGroupId;

    while (isDefined(groupId) && !groupIds.has(groupId)) {
      groupIds.add(groupId);
      groupId =
        predicateGroupById.get(
          groupId,
        )?.parentRowLevelPermissionPredicateGroupId;
    }
  }

  return groupIds;
};
