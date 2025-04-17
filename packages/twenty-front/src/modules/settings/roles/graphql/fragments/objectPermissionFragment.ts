import { gql } from '@apollo/client';

export const OBJECT_PERMISSION_FRAGMENT = gql`
  fragment ObjectPermissionFragment on ObjectPermission {
    id
    objectMetadataId
    roleId
    canReadObjectRecords
    canUpdateObjectRecords
    canSoftDeleteObjectRecords
    canDestroyObjectRecords
  }
`;
