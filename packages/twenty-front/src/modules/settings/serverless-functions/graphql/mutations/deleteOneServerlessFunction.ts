import { gql } from '@apollo/client';

export const DELETE_ONE_SERVERLESS_FUNCTION = gql`
  mutation DeleteOneServerlessFunction($input: DeleteServerlessFunctionInput!) {
    deleteOneServerlessFunction(input: $input) {
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
