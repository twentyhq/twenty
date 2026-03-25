import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '@/settings/developers/graphql/fragments/apiKeyFragment';

export const GET_API_KEY = gql`
  query GetApiKey($input: GetApiKeyInput!) {
    apiKey(input: $input) {
      ...ApiKeyFragment
      createdAt
    }
  }
  ${API_KEY_FRAGMENT}
`;
