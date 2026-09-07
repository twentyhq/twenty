import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS = gql`
  query GetCoreWorkflows(
    $first: Int
    $after: String
    $orderBy: CoreWorkflowOrderByField
    $orderByDirection: CoreWorkflowOrderByDirection
    $filter: CoreWorkflowFilterInput
  ) {
    coreWorkflows(
      first: $first
      after: $after
      orderBy: $orderBy
      orderByDirection: $orderByDirection
      filter: $filter
    ) {
      edges {
        node {
          id
          name
          statuses
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
