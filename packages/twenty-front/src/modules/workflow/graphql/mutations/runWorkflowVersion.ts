import { gql } from '@apollo/client';

export const RUN_WORKFLOW_VERSION = gql`
  mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
    runWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;
