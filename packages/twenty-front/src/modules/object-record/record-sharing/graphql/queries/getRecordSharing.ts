import { gql } from '@apollo/client';

export const GET_RECORD_SHARING = gql`
  query GetRecordSharing($target: RecordSharingTargetInput!) {
    recordSharing(target: $target) {
      viewerAccessLevel
      permissions {
        canRead
        canUpdate
        canDelete
        canSoftDelete
      }
      isEnabled
      hasInheritedAccess
      shares {
        id
        principalId
        principalType
        accessLevel
        rowCause
      }
      roles {
        id
        label
      }
    }
  }
`;
