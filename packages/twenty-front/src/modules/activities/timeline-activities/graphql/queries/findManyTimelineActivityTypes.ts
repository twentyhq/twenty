import { gql } from '@apollo/client';

export const FIND_MANY_TIMELINE_ACTIVITY_TYPES = gql`
  query FindManyTimelineActivityTypes {
    timelineActivityTypes {
      id
      universalIdentifier
      name
      label
      action
      icon
      objectUniversalIdentifier
      frontComponentUniversalIdentifier
    }
  }
`;
