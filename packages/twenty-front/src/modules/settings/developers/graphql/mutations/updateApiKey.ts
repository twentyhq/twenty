import gql from 'graphql-tag';
import { API_KEY_FRAGMENT } from '../fragments/apiKeyFragment';

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($input: UpdateApiKeyDTO!) {
    updateApiKey(input: $input) {
      ...ApiKeyFragment
    }
  }
  ${API_KEY_FRAGMENT}
`;
