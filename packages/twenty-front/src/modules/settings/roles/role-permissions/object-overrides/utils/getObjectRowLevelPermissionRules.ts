import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

type ObjectRowLevelPermissionRule = {
  rule: RowLevelPermissionRule;
  predicates: RowLevelPermissionPredicate[];
};

export const getObjectRowLevelPermissionRules = ({
  role,
  objectMetadataId,
}: {
  role: Pick<
    RoleWithPartialMembers,
    'rowLevelPermissionRules' | 'rowLevelPermissionPredicates'
  >;
  objectMetadataId: string;
}): ObjectRowLevelPermissionRule[] =>
  (role.rowLevelPermissionRules ?? [])
    .filter(
      (rule) =>
        rule.objectMetadataId === objectMetadataId &&
        (role.rowLevelPermissionPredicates ?? []).some(
          (predicate) => predicate.rowLevelPermissionRuleId === rule.id,
        ),
    )
    .map((rule) => ({
      rule,
      predicates: (role.rowLevelPermissionPredicates ?? []).filter(
        (predicate) =>
          predicate.rowLevelPermissionRuleId === rule.id &&
          !isDefined(predicate.relationFieldMetadataId),
      ),
    }));
