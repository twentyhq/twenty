import { gql } from '@apollo/client';

export const ADD_ACTIVITY_TARGETS = gql`
  mutation AddActivityTargetsOnActivity(
    $activityId: String!
    $activityTargetInputs: [ActivityTargetCreateManyActivityInput!]!
  ) {
    updateOneActivity(
      where: { id: $activityId }
      data: { activityTargets: { createMany: { data: $activityTargetInputs } } }
    ) {
      ...ActivityWithTargets
    }
  }
`;
