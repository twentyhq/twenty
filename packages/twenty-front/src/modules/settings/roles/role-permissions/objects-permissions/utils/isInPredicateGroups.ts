import { isDefined } from 'twenty-shared/utils';

export const isInPredicateGroups = ({
  rowLevelPermissionPredicateGroupId,
  predicateGroupIds,
}: {
  rowLevelPermissionPredicateGroupId?: string | null;
  predicateGroupIds: Set<string>;
}) =>
  isDefined(rowLevelPermissionPredicateGroupId) &&
  predicateGroupIds.has(rowLevelPermissionPredicateGroupId);
