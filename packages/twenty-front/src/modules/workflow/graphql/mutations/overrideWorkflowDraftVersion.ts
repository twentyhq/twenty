import { gql } from '@apollo/client';

export const OVERRIDE_WORKFLOW_DRAFT_VERSION = gql`
  mutation CreateDraftFromWorkflowVersion(
    $input: CreateDraftFromWorkflowVersionInput!
  ) {
    createDraftFromWorkflowVersion(input: $input)
  }
`;
