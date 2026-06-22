import { gql } from '@apollo/client';

export const getTimelineProjectionRules = gql`
  query GetTimelineProjectionRules {
    getTimelineProjectionRules {
      id
      anchorObjectMetadataId
      sourceObjectMetadataId
      linkedObjectMetadataIds
    }
  }
`;
