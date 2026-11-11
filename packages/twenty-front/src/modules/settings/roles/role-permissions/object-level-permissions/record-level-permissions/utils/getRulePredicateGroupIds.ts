/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import { type RowLevelPermissionPredicateGroup } from '~/generated-metadata/graphql';

export const getRulePredicateGroupIds = ({
  predicateGroups,
  ruleRootGroupId,
}: {
  predicateGroups: Pick<
    RowLevelPermissionPredicateGroup,
    'id' | 'parentRowLevelPermissionPredicateGroupId'
  >[];
  ruleRootGroupId: string;
}): Set<string> => {
  const rulePredicateGroupIds = new Set([ruleRootGroupId]);

  for (let depth = 0; depth < predicateGroups.length; depth++) {
    for (const predicateGroup of predicateGroups) {
      if (
        isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId) &&
        rulePredicateGroupIds.has(
          predicateGroup.parentRowLevelPermissionPredicateGroupId,
        )
      ) {
        rulePredicateGroupIds.add(predicateGroup.id);
      }
    }
  }

  return rulePredicateGroupIds;
};
