import { gql } from '@apollo/client';

export const REMOVE_ACTIVITY_TARGETS = gql`
  mutation RemoveActivityTargetsOnActivity(
    $activityId: String!
    $activityTargetIds: [String!]!
  ) {
    updateOneActivity(
      where: { id: $activityId }
      data: {
        activityTargets: { deleteMany: { id: { in: $activityTargetIds } } }
      }
    ) {
      id
      createdAt
      updatedAt
      activityTargets {
        id
        createdAt
        updatedAt
        companyId
        personId
      }
    }
  }
`;
//
