import { gql } from '@apollo/client';

export const EXECUTE_ONE_SERVERLESS_FUNCTION = gql`
  mutation ExecuteOneServerlessFunction(
    $input: ExecuteServerlessFunctionInput!
  ) {
    executeOneServerlessFunction(input: $input) {
      data
      logs
      duration
      status
      error
    }
  }
`;
