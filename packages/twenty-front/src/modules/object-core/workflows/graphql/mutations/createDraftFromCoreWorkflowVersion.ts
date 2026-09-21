import { gql } from '@apollo/client';

export const CREATE_DRAFT_FROM_CORE_WORKFLOW_VERSION = gql`
  mutation CreateDraftFromCoreWorkflowVersion(
    $input: CreateDraftFromCoreWorkflowVersionInput!
  ) {
    createDraftFromWorkflowVersion: createDraftFromCoreWorkflowVersion(
      input: $input
    ) {
      id
      coreWorkflowId
      label
      status
      trigger
      steps
      createdAt
      updatedAt
    }
  }
`;
