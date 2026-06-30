import { gql } from '@apollo/client';

export const CREATE_DRAFT_FROM_WORKFLOW_VERSION = gql`
  mutation CreateDraftFromWorkflowVersion(
    $input: CreateDraftFromWorkflowVersionInput!
  ) {
    createDraftFromWorkflowVersion(input: $input) {
      id
      name
      status
      trigger
      steps
      createdAt
      updatedAt
    }
  }
`;
