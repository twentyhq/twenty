/* @license Enterprise */

import { gql } from '@apollo/client';

export const ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT = gql`
  fragment RowLevelPermissionPredicateFragment on RowLevelPermissionPredicate {
    id
    fieldMetadataId
    relationFieldMetadataId
    objectMetadataId
    operand
    subFieldName
    workspaceMemberFieldMetadataId
    workspaceMemberSubFieldName
    rowLevelPermissionPredicateGroupId
    positionInRowLevelPermissionPredicateGroup
    roleId
    value
  }
`;
