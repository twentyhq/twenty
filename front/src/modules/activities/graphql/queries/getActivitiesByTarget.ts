import { gql } from '@apollo/client';

export const GET_ACTIVITIES_BY_TARGETS = gql`
  query GetActivitiesByTargets(
    $activityTargetIds: [String!]!
    $orderBy: [ActivityOrderByWithRelationInput!]
  ) {
    findManyActivities(
      orderBy: $orderBy
      where: {
        activityTargets: {
          some: {
            OR: [
              { personId: { in: $activityTargetIds } }
              { companyId: { in: $activityTargetIds } }
            ]
          }
        }
      }
    ) {
      ...ActivityQueryFragment
    }
  }
`;
