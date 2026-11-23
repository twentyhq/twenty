/* @license Enterprise */

import { ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateFragment';
import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateGroupFragment';
import { gql } from '@apollo/client';

export const UPSERT_ROW_LEVEL_PERMISSION_RULES = gql`
  ${ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT}
  ${ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT}
  mutation UpsertRowLevelPermissionRules(
    $input: UpsertRowLevelPermissionRulesInput!
  ) {
    upsertRowLevelPermissionRules(input: $input) {
      rules {
        id
        objectMetadataId
        canCreateRecords
        canReadRecords
        canUpdateRecords
        canSoftDeleteRecords
        canDestroyRecords
      }
      predicates {
        ...RowLevelPermissionPredicateFragment
      }
      predicateGroups {
        ...RowLevelPermissionPredicateGroupFragment
      }
    }
  }
`;
