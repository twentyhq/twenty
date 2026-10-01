import { gql } from '@apollo/client';

export const RUN_CORE_WORKFLOW_VERSION = gql`
  mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
    runWorkflowVersion: runCoreWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;
