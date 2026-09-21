import { gql } from '@apollo/client';

export const UPDATE_CORE_WORKFLOW_VERSION_TRIGGER = gql`
  mutation UpdateCoreWorkflowVersionTrigger(
    $input: UpdateCoreWorkflowVersionTriggerInput!
  ) {
    updateWorkflowVersionTrigger: updateCoreWorkflowVersionTrigger(
      input: $input
    ) {
      trigger
    }
  }
`;
