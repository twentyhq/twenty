import { gql } from '@apollo/client';

export const ACTIVATE_WORKFLOW_VERSION = gql`
  mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
    activateWorkflowVersion(workflowVersionId: $workflowVersionId)
  }
`;
