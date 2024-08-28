import { gql } from '@apollo/client';

export const EXECUTE_ONE_SERVERLESS_FUNCTION = gql`
  mutation ExecuteOneServerlessFunction(
    $input: ExecuteServerlessFunctionInput!
  ) {
    executeOneServerlessFunction(input: $input) {
      data
      duration
      status
      error
    }
  }
`;
