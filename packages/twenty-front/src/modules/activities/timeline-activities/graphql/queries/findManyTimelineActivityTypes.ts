import { gql } from '@apollo/client';

export const FIND_MANY_TIMELINE_ACTIVITY_TYPES = gql`
  query FindManyTimelineActivityTypes {
    timelineActivityTypes {
      id
      name
      label
      action
      icon
      renderer
      objectUniversalIdentifier
    }
  }
`;
