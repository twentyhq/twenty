import { gql } from '@apollo/client';

export const UPDATE_TIMELINE_ACTIVITY_TYPE_IS_ACTIVE = gql`
  mutation UpdateTimelineActivityTypeIsActive(
    $input: UpdateTimelineActivityTypeInput!
  ) {
    updateTimelineActivityType(input: $input) {
      id
      isActive
    }
  }
`;
