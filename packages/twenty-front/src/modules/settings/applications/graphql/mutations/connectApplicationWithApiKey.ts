import { gql } from '@apollo/client';

export const CONNECT_APPLICATION_WITH_API_KEY = gql`
  mutation ConnectApplicationWithApiKey(
    $input: ConnectApplicationWithApiKeyInput!
  ) {
    connectApplicationWithApiKey(input: $input)
  }
`;
