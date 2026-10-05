import { gql } from '@apollo/client';

export const DUPLICATE_CORE_WORKFLOW = gql`
  mutation DuplicateCoreWorkflow($input: DuplicateCoreWorkflowInput!) {
    duplicateWorkflow: duplicateCoreWorkflow(input: $input) {
      id
    }
  }
`;
