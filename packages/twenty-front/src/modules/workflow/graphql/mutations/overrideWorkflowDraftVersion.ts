import { gql } from '@apollo/client';

export const OVERRIDE_WORKFLOW_DRAFT_VERSION = gql`
  mutation OverrideWorkflowDraftVersion(
    $input: OverrideWorkflowDraftVersionInput!
  ) {
    overrideWorkflowDraftVersion(input: $input)
  }
`;
