import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS = gql`
  query GetCoreWorkflows {
    coreWorkflows {
      id
      name
      statuses
      applicationId
      workspaceWorkflowId
      updatedAt
    }
  }
`;
