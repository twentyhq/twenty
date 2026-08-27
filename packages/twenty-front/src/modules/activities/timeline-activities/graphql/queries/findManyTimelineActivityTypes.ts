import { gql } from '@apollo/client';

export const FIND_MANY_TIMELINE_ACTIVITY_TYPES = gql`
  query FindManyTimelineActivityTypes {
    timelineActivityTypes {
      id
      applicationId
      universalIdentifier
      name
      label
      icon
      emit {
        on
        objectUniversalIdentifier
      }
      frontComponentUniversalIdentifier
      isActive
    }
  }
`;
