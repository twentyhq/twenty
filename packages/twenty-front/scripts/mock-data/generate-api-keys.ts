/* eslint-disable no-console */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const API_KEYS_QUERY = `
  query ApiKeys {
    apiKeys {
      __typename
      id
      name
      expiresAt
      createdAt
      updatedAt
      revokedAt
      role {
        __typename
        id
        label
        icon
      }
    }
  }
`;

export const generateApiKeys = async (token: string) => {
  console.log('Fetching API keys from /metadata ...');

  const data = (await graphqlRequest('/metadata', API_KEYS_QUERY, token)) as {
    apiKeys: Record<string, unknown>[];
  };

  console.log(`  Got ${data.apiKeys.length} API keys.`);

  writeGeneratedFile(
    'metadata/api-keys/mock-api-keys-data.ts',
    'mockedApiKeys',
    'Record<string, unknown>[]',
    '',
    data.apiKeys,
  );
};
