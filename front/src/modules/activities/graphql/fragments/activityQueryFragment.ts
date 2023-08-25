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
