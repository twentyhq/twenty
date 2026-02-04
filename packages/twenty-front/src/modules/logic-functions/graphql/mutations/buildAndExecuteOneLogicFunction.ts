import { gql } from '@apollo/client';

export const BUILD_AND_EXECUTE_ONE_LOGIC_FUNCTION = gql`
  mutation BuildAndExecuteOneLogicFunction(
    $input: BuildAndExecuteOneLogicFunctionInput!
  ) {
    buildAndExecuteOneLogicFunction(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
