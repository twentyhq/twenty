import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '@/settings/developers/graphql/fragments/apiKeyFragment';

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      ...ApiKeyFragment
    }
  }
  ${API_KEY_FRAGMENT}
`;
