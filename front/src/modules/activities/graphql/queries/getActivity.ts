import { gql } from '@apollo/client';

export const GET_ACTIVITY = gql`
  query GetActivity($activityId: String!) {
    findManyActivities(where: { id: { equals: $activityId } }) {
      ...ActivityQueryFragment
    }
  }
`;
