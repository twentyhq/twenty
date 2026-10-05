import { gql } from '@apollo/client';

export const DEACTIVATE_CORE_WORKFLOW_VERSION = gql`
  mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    deactivateWorkflowVersion: deactivateCoreWorkflowVersion(
      coreWorkflowVersionId: $coreWorkflowVersionId
    )
  }
`;
