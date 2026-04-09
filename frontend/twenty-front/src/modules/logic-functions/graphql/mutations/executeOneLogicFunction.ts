import { gql } from '@apollo/client';

export const EXECUTE_ONE_LOGIC_FUNCTION = gql`
  mutation ExecuteOneLogicFunction($input: ExecuteOneLogicFunctionInput!) {
    executeOneLogicFunction(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
