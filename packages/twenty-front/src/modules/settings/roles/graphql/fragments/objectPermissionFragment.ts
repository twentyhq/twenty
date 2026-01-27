import { ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateFragment';
import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateGroupFragment';
import { gql } from '@apollo/client';

export const OBJECT_PERMISSION_FRAGMENT = gql`
  fragment ObjectPermissionFragment on ObjectPermission {
    objectMetadataId
    canReadObjectRecords
    canUpdateObjectRecords
    canSoftDeleteObjectRecords
    canDestroyObjectRecords
    restrictedFields
    rowLevelPermissionPredicates {
      ...RowLevelPermissionPredicateFragment
    }
    rowLevelPermissionPredicateGroups {
      ...RowLevelPermissionPredicateGroupFragment
    }
  }
  ${ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT}
  ${ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT}
`;
