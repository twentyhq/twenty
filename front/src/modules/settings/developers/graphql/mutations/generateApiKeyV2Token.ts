import { gql } from '@apollo/client';

export const GENERATE_ONE_API_KEY_TOKEN = gql`
  mutation GenerateOneApiKeyToken($data: ApiKeyCreateInput!) {
    generateApiKeyV2Token(data: $data) {
      token
    }
  }
`;
