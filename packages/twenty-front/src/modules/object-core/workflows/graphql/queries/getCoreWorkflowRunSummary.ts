import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOW_RUN_SUMMARY = gql`
  query GetCoreWorkflowRunSummary($coreWorkflowId: UUID!) {
    coreWorkflowRunSummary(coreWorkflowId: $coreWorkflowId) {
      coreWorkflowId
      runCountLast14Days
      isRunCountLowerBound
    }
  }
`;
