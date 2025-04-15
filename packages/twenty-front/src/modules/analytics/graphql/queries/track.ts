import { gql } from '@apollo/client';

export const TRACKV2 = gql`
  mutation TrackV2(
    $type: AnalyticsType!
    $event: String
    $name: String
    $properties: JSON
  ) {
    trackV2(type: $type, event: $event, name: $name, properties: $properties) {
      success
    }
  }
`;
