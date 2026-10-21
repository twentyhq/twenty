import { gql } from '@apollo/client';

export const OBJECT_PERMISSION_FRAGMENT = gql`
  fragment ObjectPermissionFragment on ObjectPermission {
    objectMetadataId
    canReadObjectRecords
    canUpdateObjectRecords
    canSoftDeleteObjectRecords
    canDestroyObjectRecords
    restrictedFields
  }
`;
