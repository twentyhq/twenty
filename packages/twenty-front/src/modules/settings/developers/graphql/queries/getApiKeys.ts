import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '@/settings/developers/graphql/fragments/apiKeyFragment';

export const GET_API_KEYS = gql`
  query GetApiKeys {
    apiKeys {
      ...ApiKeyFragment
    }
  }
  ${API_KEY_FRAGMENT}
`;
