import { gql } from '@apollo/client';

export const CREATE_CORE_WORKFLOW = gql`
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
      name
      statuses
      workspaceWorkflowId
      updatedAt
    }
  }
`;
