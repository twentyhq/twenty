import { gql } from '@apollo/client';

export const APPLICATION_GRANT_FRAGMENT = gql`
  fragment ApplicationGrantFragment on ApplicationGrant {
    applicationId
    grantRoleId
    requestedRoleId
    applicationVersion
    requestedAllObjectsActions
    lockedObjectPermissions {
      objectMetadataId
      canReadObjectRecords
      canUpdateObjectRecords
      canSoftDeleteObjectRecords
      canDestroyObjectRecords
    }
    pendingPermissions {
      type
      label
      action
      objectMetadataId
      permissionFlagUniversalIdentifier
    }
  }
`;
