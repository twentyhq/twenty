import { gql } from '@apollo/client';

export const getTimelineThreadChannelsFromObjectRecord = gql`
  query GetTimelineThreadChannelsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    getTimelineThreadChannelsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      type
      provider
      applicationId
    }
  }
`;
