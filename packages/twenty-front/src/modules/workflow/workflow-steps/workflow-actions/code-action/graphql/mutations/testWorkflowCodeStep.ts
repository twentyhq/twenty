import { gql } from '@apollo/client';

export const TEST_WORKFLOW_CODE_STEP = gql`
  mutation TestWorkflowCodeStep($input: TestWorkflowCodeStepInput!) {
    testWorkflowCodeStep(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
