import { gql } from '@apollo/client';

export const TRACK_ANALYTICS = gql`
  mutation TrackAnalytics(
    $type: AnalyticsType!
    $event: String
    $name: String
    $properties: JSON
  ) {
    trackAnalytics(
      type: $type
      event: $event
      name: $name
      properties: $properties
    ) {
      success
    }
  }
`;
