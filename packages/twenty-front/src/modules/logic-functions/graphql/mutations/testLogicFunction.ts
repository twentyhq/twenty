import { gql } from '@apollo/client';

export const TEST_LOGIC_FUNCTION = gql`
  mutation TestLogicFunction($input: TestLogicFunctionInput!) {
    testLogicFunction(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
