import gql from 'graphql-tag';

export const CONNECT_APPLICATION_WITH_API_KEY = gql`
  mutation ConnectApplicationWithApiKey(
    $input: ConnectApplicationWithApiKeyInput!
  ) {
    connectApplicationWithApiKey(input: $input)
  }
`;
