import { gql } from '@apollo/client';

export const WORKFLOW_DIFF_FRAGMENT = gql`
  fragment WorkflowDiffFragment on WorkflowVersionStepChanges {
    triggerDiff
    stepsDiff
  }
`;
