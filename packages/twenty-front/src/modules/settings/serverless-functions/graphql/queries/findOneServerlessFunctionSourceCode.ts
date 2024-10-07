import { gql } from '@apollo/client';

export const FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE = gql`
  query FindOneServerlessFunctionSourceCode(
    $input: GetServerlessFunctionSourceCodeInput!
  ) {
    getServerlessFunctionSourceCode(input: $input)
  }
`;
