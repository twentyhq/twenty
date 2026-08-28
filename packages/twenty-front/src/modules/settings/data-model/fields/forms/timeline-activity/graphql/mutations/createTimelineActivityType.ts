import { gql } from '@apollo/client';

export const CREATE_TIMELINE_ACTIVITY_TYPE = gql`
  mutation CreateTimelineActivityType(
    $input: CreateTimelineActivityTypeInput!
  ) {
    createTimelineActivityType(input: $input) {
      id
      universalIdentifier
      name
      label
      icon
      emit {
        on
        objectUniversalIdentifier
        through {
          relationFieldUniversalIdentifier
        }
      }
      isActive
    }
  }
`;
