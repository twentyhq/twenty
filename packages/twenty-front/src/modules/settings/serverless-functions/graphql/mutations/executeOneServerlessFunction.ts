import { gql } from '@apollo/client';

export const EXECUTE_ONE_SERVERLESS_FUNCTION = gql`
  mutation ExecuteOneServerlessFunction($id: UUID!, $payload: JSON!) {
    executeOneServerlessFunction(id: $id, payload: $payload) {
      data
      duration
      status
      error
    }
  }
`;
