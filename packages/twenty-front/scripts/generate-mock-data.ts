/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000';
const AUTH_EMAIL = 'tim@apple.dev';
const AUTH_PASSWORD = 'tim@apple.dev';
const WORKSPACE_SUBDOMAIN = 'apple';

const serverUrl = new URL(SERVER_BASE_URL);
const WORKSPACE_ORIGIN = `${serverUrl.protocol}//${WORKSPACE_SUBDOMAIN}.${serverUrl.host}`;

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = path.resolve(
  currentDir,
  '../src/testing/mock-data/generated',
);

const graphqlRequest = async (
  endpoint: string,
  query: string,
  token?: string,
): Promise<unknown> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: WORKSPACE_ORIGIN,
  };

  if (token !== undefined) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${SERVER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  const json = (await response.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };

  if (
    json.errors !== undefined &&
    json.errors !== null &&
    json.errors.length > 0
  ) {
    const errorDetails = json.errors.map((error) => error.message).join(', ');
    throw new Error(`GraphQL error on ${endpoint}: ${errorDetails}`);
  }

  return json.data;
};

const authenticate = async (): Promise<string> => {
  console.log(
    `Authenticating as ${AUTH_EMAIL} on workspace ${WORKSPACE_SUBDOMAIN}...`,
  );

  const loginData = (await graphqlRequest(
    '/metadata',
    `mutation GetLoginTokenFromCredentials {
      getLoginTokenFromCredentials(
        email: "${AUTH_EMAIL}",
        password: "${AUTH_PASSWORD}",
        origin: "${WORKSPACE_ORIGIN}"
      ) {
        loginToken { token }
      }
    }`,
  )) as {
    getLoginTokenFromCredentials: { loginToken: { token: string } };
  };

  const loginToken = loginData.getLoginTokenFromCredentials.loginToken.token;

  const authData = (await graphqlRequest(
    '/metadata',
    `mutation GetAuthTokensFromLoginToken {
      getAuthTokensFromLoginToken(
        loginToken: "${loginToken}",
        origin: "${WORKSPACE_ORIGIN}"
      ) {
        tokens {
          accessOrWorkspaceAgnosticToken { token }
        }
      }
    }`,
  )) as {
    getAuthTokensFromLoginToken: {
      tokens: { accessOrWorkspaceAgnosticToken: { token: string } };
    };
  };

  const accessToken =
    authData.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
      .token;

  console.log('Authenticated successfully.');
  return accessToken;
};

// Apollo Client automatically adds __typename to every object level;
// raw fetch does not, so we include it explicitly here.
const METADATA_QUERY = `
  query ObjectMetadataItems {
    objects(paging: { first: 1000 }) {
      __typename
      edges {
        __typename
        node {
          __typename
          id
          universalIdentifier
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isCustom
          isRemote
          isActive
          isSystem
          isUIReadOnly
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          applicationId
          shortcut
          isLabelSyncedWithName
          isSearchable
          duplicateCriteria
          indexMetadataList {
            __typename
            id
            createdAt
            updatedAt
            name
            indexWhereClause
            indexType
            isUnique
            isCustom
            indexFieldMetadataList {
              __typename
              id
              fieldMetadataId
              createdAt
              updatedAt
              order
            }
          }
          fieldsList {
            __typename
            id
            universalIdentifier
            type
            name
            label
            description
            icon
            isCustom
            isActive
            isSystem
            isUIReadOnly
            isNullable
            isUnique
            createdAt
            updatedAt
            defaultValue
            options
            settings
            isLabelSyncedWithName
            morphId
            applicationId
            relation {
              __typename
              type
              sourceObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                __typename
                id
                name
              }
              targetFieldMetadata {
                __typename
                id
                name
              }
            }
            morphRelations {
              __typename
              type
              sourceObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                __typename
                id
                name
              }
              targetFieldMetadata {
                __typename
                id
                name
              }
            }
          }
        }
      }
      pageInfo {
        __typename
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const main = async () => {
  console.log(`Server: ${SERVER_BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const token = await authenticate();

  console.log('Fetching object metadata from /metadata ...');
  const metadata = await graphqlRequest('/metadata', METADATA_QUERY, token);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const filePath = path.join(OUTPUT_DIR, 'mock-metadata-query-result.ts');
  const content = [
    '/* eslint-disable */',
    '// @ts-nocheck',
    "import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';",
    '',
    '// This file was automatically generated by scripts/generate-mock-data.ts',
    '// Do not edit this file manually.',
    '',
    '// prettier-ignore',
    'export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery =',
    JSON.stringify(metadata, null, 2) + ';',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Written: ${filePath}`);
  console.log('Done!');
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
