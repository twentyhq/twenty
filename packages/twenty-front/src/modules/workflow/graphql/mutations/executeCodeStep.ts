import { gql } from '@apollo/client';

export const EXECUTE_CODE_STEP = gql`
  mutation ExecuteCodeStep($input: ExecuteCodeStepInput!) {
    executeCodeStep(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
