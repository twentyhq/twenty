import { gql } from '@apollo/client';

export const GET_ACTIVITIES_BY_TARGETS = gql`
  query GetActivitiesByTargets(
    $activityTargetIds: [String!]!
    $orderBy: [ActivityOrderByWithRelationInput!]
  ) {
    findManyActivities(
      orderBy: $orderBy
      where: {
        activityTargets: { some: { personId: { in: $activityTargetIds } } }
      }
    ) {
      id
      createdAt
      title
      body
      type
      author {
        id
        firstName
        lastName
        displayName
      }
      comments {
        id
        body
        createdAt
        updatedAt
        author {
          id
          displayName
          firstName
          lastName
          avatarUrl
        }
      }
      activityTargets {
        id
        personId
        companyId
      }
    }
  }
`;

export const GET_ACTIVITY = gql`
  query GetActivity($activityId: String!) {
    findManyActivities(where: { id: { equals: $activityId } }) {
      id
      createdAt
      body
      title
      type
      author {
        id
        firstName
        lastName
        displayName
      }
      comments {
        id
        body
        createdAt
        updatedAt
        author {
          id
          displayName
          firstName
          lastName
          avatarUrl
        }
      }
      activityTargets {
        id
        personId
        companyId
      }
    }
  }
`;
