import { gql } from '@apollo/client';

export const ACTIVATE_CORE_WORKFLOW_VERSION = gql`
  mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    activateWorkflowVersion: activateCoreWorkflowVersion(
      coreWorkflowVersionId: $coreWorkflowVersionId
    )
  }
`;
