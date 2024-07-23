import { gql } from '@apollo/client';

export const CREATE_ONE_SERVERLESS_FUNCTION = gql`
  mutation CreateOneServerlessFunctionItem(
    $input: CreateServerlessFunctionInput!
  ) {
    createOneServerlessFunction(input: $input) {
      id
      name
      description
      sourceCodeHash
      sourceCodeFullPath
      runtime
      syncStatus
      createdAt
      updatedAt
    }
  }
`;
