import { gql } from '@apollo/client';

export const EXECUTE_ONE_SERVERLESS_FUNCTION = gql`
  mutation ExecuteOneServerlessFunction(
    $id: UUID!
    $payload: JSON!
    $version: String!
  ) {
    executeOneServerlessFunction(
      id: $id
      payload: $payload
      version: $version
    ) {
      data
      duration
      status
      error
    }
  }
`;
