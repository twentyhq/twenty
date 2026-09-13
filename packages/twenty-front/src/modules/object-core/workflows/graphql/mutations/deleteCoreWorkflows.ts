import { gql } from '@apollo/client';

export const DELETE_CORE_WORKFLOWS = gql`
  mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
    deleteCoreWorkflows(input: $input) {
      id
      workspaceWorkflowId
    }
  }
`;
