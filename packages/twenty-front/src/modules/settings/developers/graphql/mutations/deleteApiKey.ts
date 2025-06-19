import gql from 'graphql-tag';

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($input: DeleteApiKeyDTO!) {
    deleteCoreApiKey(input: $input)
  }
`;
