import { gql } from '@apollo/client';

export const RECORD_SHARING_FRAGMENT = gql`
  fragment RecordSharingFields on RecordSharingDTO {
    viewerAccessLevel
    permissions {
      canRead
      canUpdate
      canDelete
      canSoftDelete
    }
    isEnabled
    hasInheritedAccess
    isOpenByDefault
    generalAccessLevel
    isGeneralAccessDefault
    sharingReach
    shares {
      id
      principalId
      principalType
      accessLevel
      rowCause
      canRoleRead
      canRoleUpdate
    }
    roles {
      id
      label
    }
  }
`;
