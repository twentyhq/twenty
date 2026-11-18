import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_LEGACY_MAPPING = gql`
  query GetCoreWorkflowLegacyMapping($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
  }
`;
