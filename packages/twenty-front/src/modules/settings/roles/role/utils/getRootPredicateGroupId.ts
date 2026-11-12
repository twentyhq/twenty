import { isDefined } from 'twenty-shared/utils';
import { type RowLevelPermissionPredicateGroup } from '~/generated-metadata/graphql';

export const getRootPredicateGroupId = ({
  predicateGroupId,
  predicateGroupById,
}: {
  predicateGroupId: string;
  predicateGroupById: Map<string, RowLevelPermissionPredicateGroup>;
}) => {
  const visitedPredicateGroupIds = new Set<string>();
  let predicateGroup = predicateGroupById.get(predicateGroupId);

  while (
    isDefined(predicateGroup?.parentRowLevelPermissionPredicateGroupId) &&
    !visitedPredicateGroupIds.has(predicateGroup.id)
  ) {
    visitedPredicateGroupIds.add(predicateGroup.id);
    predicateGroup = predicateGroupById.get(
      predicateGroup.parentRowLevelPermissionPredicateGroupId,
    );
  }

  return predicateGroup?.id;
};
