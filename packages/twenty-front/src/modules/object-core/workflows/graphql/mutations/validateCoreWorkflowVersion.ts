import { gql } from '@apollo/client';

export const VALIDATE_CORE_WORKFLOW_VERSION = gql`
  mutation ValidateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    validateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
  }
`;
