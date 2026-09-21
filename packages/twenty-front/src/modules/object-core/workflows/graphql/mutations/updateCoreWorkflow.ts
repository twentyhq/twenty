import { gql } from '@apollo/client';

export const UPDATE_CORE_WORKFLOW = gql`
  mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
    updateCoreWorkflow(input: $input) {
      id
      name
      updatedAt
    }
  }
`;
