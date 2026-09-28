import { gql } from '@apollo/client';

export const GET_RECORD_PERMISSIONS = gql`
  query GetRecordPermissions($targets: [RecordPermissionsTargetInput!]!) {
    recordPermissions(targets: $targets) {
      objectMetadataId
      recordId
      permissions {
        canRead
        canUpdate
        canDelete
        canSoftDelete
      }
    }
  }
`;
