/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000';
const AUTH_EMAIL = 'jane.austen@apple.dev';
const AUTH_PASSWORD = 'tim@apple.dev';
const WORKSPACE_SUBDOMAIN = 'apple';

const serverUrl = new URL(SERVER_BASE_URL);
export const WORKSPACE_ORIGIN = `${serverUrl.protocol}//${WORKSPACE_SUBDOMAIN}.${serverUrl.host}`;

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const GENERATED_DIR = path.resolve(
  currentDir,
  '../../src/testing/mock-data/generated',
);

export const graphqlRequest = async (
  endpoint: string,
  query: string,
  token?: string,
  variables?: Record<string, unknown>,
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
    body: JSON.stringify({ query, variables }),
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

export const authenticate = async (): Promise<string> => {
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

export const writeGeneratedFile = (
  relativePath: string,
  exportName: string,
  typeName: string,
  typeImport: string,
  data: unknown,
) => {
  const filePath = path.join(GENERATED_DIR, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const content = [
    '/* eslint-disable */',
    '// @ts-nocheck',
    typeImport,
    '',
    '// This file was automatically generated — do not edit manually.',
    '',
    '// prettier-ignore',
    `export const ${exportName}: ${typeName} =`,
    JSON.stringify(data, null, 2) + ';',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Written: ${filePath}`);
};
