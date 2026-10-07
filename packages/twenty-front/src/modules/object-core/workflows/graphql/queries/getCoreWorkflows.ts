import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS = gql`
  query GetCoreWorkflows(
    $first: Int
    $after: String
    $orderBy: CoreWorkflowOrderByField
    $orderByDirection: CoreWorkflowOrderByDirection
    $filter: CoreWorkflowFilterInput
    $includeSystem: Boolean
  ) {
    coreWorkflows(
      first: $first
      after: $after
      orderBy: $orderBy
      orderByDirection: $orderByDirection
      filter: $filter
      includeSystem: $includeSystem
    ) {
      edges {
        node {
          id
          name
          statuses
          workspaceWorkflowId
          isSystem
          visibility
          canChangeVisibility
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
