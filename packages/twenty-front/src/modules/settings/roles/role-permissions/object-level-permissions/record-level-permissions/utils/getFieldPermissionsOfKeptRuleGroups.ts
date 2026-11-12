/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const getFieldPermissionsOfKeptRuleGroups = ({
  fieldPermissions,
  rulePredicateGroupIds,
  keptPredicateGroupIds,
}: {
  fieldPermissions: FieldPermission[];
  rulePredicateGroupIds: Set<string>;
  keptPredicateGroupIds: Set<string>;
}): FieldPermission[] =>
  fieldPermissions.filter(
    ({ rowLevelPermissionPredicateGroupId }) =>
      !isDefined(rowLevelPermissionPredicateGroupId) ||
      !rulePredicateGroupIds.has(rowLevelPermissionPredicateGroupId) ||
      keptPredicateGroupIds.has(rowLevelPermissionPredicateGroupId),
  );
