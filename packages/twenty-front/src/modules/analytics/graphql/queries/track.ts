import { gql } from '@apollo/client';

export const TRACK = gql`
  mutation Track(
    $type: AnalyticsType!
    $event: String
    $name: String
    $properties: JSON
  ) {
    track(type: $type, event: $event, name: $name, properties: $properties) {
      success
    }
  }
`;
