import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_STEP = gql`
  mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
    createWorkflowVersionStep(input: $input) {
      id
      name
      type
      settings
      valid
    }
  }
`;
