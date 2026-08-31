import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS = gql`
  query GetCoreWorkflows(
    $first: Int
    $after: String
    $orderBy: CoreWorkflowOrderByField
    $orderByDirection: CoreWorkflowOrderByDirection
    $statuses: [CoreWorkflowStatus!]
    $searchTerm: String
  ) {
    coreWorkflows(
      first: $first
      after: $after
      orderBy: $orderBy
      orderByDirection: $orderByDirection
      statuses: $statuses
      searchTerm: $searchTerm
    ) {
      edges {
        node {
          id
          name
          statuses
          applicationId
          workspaceWorkflowId
          updatedAt
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;
