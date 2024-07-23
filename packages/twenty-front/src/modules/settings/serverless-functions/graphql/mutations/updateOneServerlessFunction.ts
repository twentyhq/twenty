import { gql } from '@apollo/client';

export const UPDATE_ONE_SERVERLESS_FUNCTION = gql`
  mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {
    updateOneServerlessFunction(input: $input) {
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
