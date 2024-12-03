import { gql } from '@apollo/client';

export const DEACTIVATE_WORKFLOW_VERSION = gql`
  mutation DeactivateWorkflowVersion($workflowVersionId: String!) {
    deactivateWorkflowVersion(workflowVersionId: $workflowVersionId)
  }
`;
