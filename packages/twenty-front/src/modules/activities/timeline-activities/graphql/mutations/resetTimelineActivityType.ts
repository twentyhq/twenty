import { gql } from '@apollo/client';

export const RESET_TIMELINE_ACTIVITY_TYPE = gql`
  mutation ResetTimelineActivityType($id: UUID!) {
    resetTimelineActivityType(id: $id) {
      id
      label
      icon
      isActive
    }
  }
`;
