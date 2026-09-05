import { gql } from '@apollo/client';

import { ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateFragment';
import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateGroupFragment';

export const SHARING_RULE_FRAGMENT = gql`
  ${ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT}
  ${ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT}
  fragment SharingRuleFields on SharingRule {
    id
    objectMetadataId
    name
    description
    granteePrincipalType
    granteePrincipalId
    granteeRoleId
    accessLevel
    isActive
    rowLevelPermissionPredicates {
      ...RowLevelPermissionPredicateFragment
      sharingRuleId
    }
    rowLevelPermissionPredicateGroups {
      ...RowLevelPermissionPredicateGroupFragment
      sharingRuleId
    }
  }
`;
