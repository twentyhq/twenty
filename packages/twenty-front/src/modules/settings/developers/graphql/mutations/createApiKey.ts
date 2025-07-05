import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '../fragments/apiKeyFragment';

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyDTO!) {
    createApiKey(input: $input) {
      ...ApiKeyFragment
    }
  }
  ${API_KEY_FRAGMENT}
`;
