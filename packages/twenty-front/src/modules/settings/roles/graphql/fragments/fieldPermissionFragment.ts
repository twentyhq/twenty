import { gql } from '@apollo/client';

export const FIELD_PERMISSION_FRAGMENT = gql`
  fragment FieldPermissionFragment on FieldPermission {
    objectMetadataId
    fieldMetadataId
    rowLevelPermissionPredicateGroupId
    canReadFieldValue
    canUpdateFieldValue
    id
    roleId
  }
`;
