import { gql } from '@apollo/client';

export const DUPLICATE_WORKFLOW = gql`
  mutation DuplicateWorkflow($input: DuplicateWorkflowInput!) {
    duplicateWorkflow(input: $input) {
      id
      name
      status
      trigger
      steps
      createdAt
      updatedAt
      workflowId
    }
  }
`;
