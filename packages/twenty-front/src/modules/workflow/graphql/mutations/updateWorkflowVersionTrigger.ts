import { gql } from '@apollo/client';

export const UPDATE_WORKFLOW_VERSION_TRIGGER = gql`
  mutation UpdateWorkflowVersionTrigger(
    $input: UpdateWorkflowVersionTriggerInput!
  ) {
    updateWorkflowVersionTrigger(input: $input) {
      trigger
    }
  }
`;
