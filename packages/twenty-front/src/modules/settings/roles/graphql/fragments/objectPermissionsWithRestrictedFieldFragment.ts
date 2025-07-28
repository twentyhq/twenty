import { gql } from '@apollo/client';

export const OBJECT_PERMISSIONS_WITH_RESTRICTED_FIELD_FRAGMENT = gql`
  fragment ObjectPermissionsWithRestrictedFieldFragment on ObjectPermission {
    objectMetadataId
    canReadObjectRecords
    canUpdateObjectRecords
    canSoftDeleteObjectRecords
    canDestroyObjectRecords
    restrictedFields
  }
`;
