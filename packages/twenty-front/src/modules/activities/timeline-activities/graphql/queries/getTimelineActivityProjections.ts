import { gql } from '@apollo/client';

export const getTimelineActivityProjections = gql`
  query GetTimelineActivityProjections(
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    getTimelineActivityProjections(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      targetColumnName
      recordIds
      linkedObjectMetadataIds
    }
  }
`;
