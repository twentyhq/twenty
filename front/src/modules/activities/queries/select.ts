import { gql } from '@apollo/client';

export const ACTIVITY_QUERY_FRAGMENT = gql`
  fragment ActivityQueryFragment on Activity {
    id
    createdAt
    title
    body
    type
    completedAt
    dueAt
    assignee {
      id
      firstName
      lastName
      displayName
      avatarUrl
    }
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
      companyId
      personId
      company {
        id
        name
        domainName
      }
      person {
        id
        displayName
        avatarUrl
      }
    }
  }
`;

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

export const GET_ACTIVITIES = gql`
  query GetActivities(
    $where: ActivityWhereInput!
    $orderBy: [ActivityOrderByWithRelationInput!]
  ) {
    findManyActivities(orderBy: $orderBy, where: $where) {
      ...ActivityQueryFragment
    }
  }
`;

export const GET_ACTIVITY = gql`
  query GetActivity($activityId: String!) {
    findManyActivities(where: { id: { equals: $activityId } }) {
      ...ActivityQueryFragment
    }
  }
`;
