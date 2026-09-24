import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_VERSIONS = gql`
  query GetCoreWorkflowVersions($coreWorkflowId: UUID!) {
    coreWorkflowVersions: coreWorkflowVersionsByCoreWorkflowId(
      coreWorkflowId: $coreWorkflowId
    ) {
      id
      label
      status
      coreWorkflowId
      createdAt
      updatedAt
    }
  }
`;
