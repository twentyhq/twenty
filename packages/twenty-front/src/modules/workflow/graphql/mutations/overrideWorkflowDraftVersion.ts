import { gql } from '@apollo/client';

export const OVERRIDE_WORKFLOW_DRAFT_VERSION = gql`
  mutation OverrideWorkflowDraftVersion($input: DeleteWorkflowVersionStepInput!) {
    overrideWorkflowDraftVersion(input: $input) {
      id
      name
      type
      settings
      valid
    }
  }
`;

