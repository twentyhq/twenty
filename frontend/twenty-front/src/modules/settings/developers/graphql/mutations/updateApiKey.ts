import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '@/settings/developers/graphql/fragments/apiKeyFragment';

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($input: UpdateApiKeyInput!) {
    updateApiKey(input: $input) {
      ...ApiKeyFragment
    }
  }
  ${API_KEY_FRAGMENT}
`;
