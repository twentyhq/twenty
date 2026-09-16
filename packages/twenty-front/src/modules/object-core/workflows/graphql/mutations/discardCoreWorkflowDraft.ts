import { gql } from '@apollo/client';

export const DISCARD_CORE_WORKFLOW_DRAFT = gql`
  mutation DiscardCoreWorkflowDraft($input: DiscardCoreWorkflowDraftInput!) {
    discardCoreWorkflowDraft(input: $input) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      updatedAt
    }
  }
`;
