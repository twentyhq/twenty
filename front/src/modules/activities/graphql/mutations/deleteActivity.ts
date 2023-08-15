import { gql } from '@apollo/client';

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($activityId: String!) {
    deleteManyActivities(where: { id: { equals: $activityId } }) {
      count
    }
  }
`;
