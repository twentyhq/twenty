import { gql } from '@apollo/client';

export const CREATE_ONE_SERVERLESS_FUNCTION_ITEM = gql`
  mutation CreateOneServerlessFunctionItem(
    $input: CreateServerlessFunctionInput!
  ) {
    createOneServerlessFunction(input: $input) {
      id
      name
      sourceCodeHash
      sourceCodeFullPath
      runtime
      syncStatus
      createdAt
      updatedAt
    }
  }
`;
