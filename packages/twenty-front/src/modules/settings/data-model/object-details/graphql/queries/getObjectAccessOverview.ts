import { gql } from '@apollo/client';

export const GET_OBJECT_ACCESS_OVERVIEW = gql`
  query GetObjectAccessOverview($objectMetadataId: UUID!) {
    objectAccessOverview(objectMetadataId: $objectMetadataId) {
      objectMetadataId
      restrictedRecordCount
      sharedRecordCount
      roles {
        id
        label
        icon
        canRead
        canUpdate
        canSoftDelete
        canDestroy
        hasRowFilter
        canAccessAllRecords
      }
    }
  }
`;
