import { gql } from '@apollo/client';

export const RECORD_SHARING_FRAGMENT = gql`
  fragment RecordSharingFields on RecordSharingDTO {
    allowedShareAccessLevels
    usesRecordPermissionPolicy
    hasMoreShares
    hasMoreInheritedShares
    inheritedShares {
      id
      principalId
      principalType
      principalRoleId
      accessLevel
      rowCause
      sourceObjectMetadataId
      fieldUniversalIdentifiers
    }
    sharingMode
    canManageSharing
    permissions {
      canRead
      canUpdate
      canDelete
      canSoftDelete
    }
    generalAccessLevel
    defaultGeneralAccessLevel
    hasManagedGeneralAccess
    shares {
      id
      principalId
      principalType
      principalRoleId
      accessLevel
      rowCause
    }
    roles {
      id
      label
      canRead
      canUpdate
      hasSomeReadAccess
      hasSomeUpdateAccess
    }
  }
`;
