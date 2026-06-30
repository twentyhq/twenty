/* @license Enterprise */

import { gql } from '@apollo/client';

export const ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT = gql`
  fragment RowLevelPermissionPredicateGroupFragment on RowLevelPermissionPredicateGroup {
    id
    parentRowLevelPermissionPredicateGroupId
    logicalOperator
    positionInRowLevelPermissionPredicateGroup
    roleId
    objectMetadataId
  }
`;
