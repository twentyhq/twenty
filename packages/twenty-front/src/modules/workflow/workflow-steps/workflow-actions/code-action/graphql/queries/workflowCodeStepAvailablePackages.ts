import { gql } from '@apollo/client';

export const WORKFLOW_CODE_STEP_AVAILABLE_PACKAGES = gql`
  query WorkflowCodeStepAvailablePackages($workflowVersionId: UUID!) {
    workflowCodeStepAvailablePackages(workflowVersionId: $workflowVersionId)
  }
`;
