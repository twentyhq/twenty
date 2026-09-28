import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_LEGACY_MAPPING = gql`
  query GetCoreWorkflowLegacyMapping($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
  }
`;

export const GET_CORE_WORKFLOW_VERSION_LEGACY_MAPPING = gql`
  query GetCoreWorkflowVersionLegacyMapping(
    $workspaceWorkflowVersionId: UUID!
  ) {
    coreWorkflowVersion(
      workspaceWorkflowVersionId: $workspaceWorkflowVersionId
    ) {
      id
      coreWorkflowId
      workspaceWorkflowVersionId
    }
  }
`;
