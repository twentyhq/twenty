import { isNonEmptyString, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';

const CONFIDENTIAL_TOKEN_ENDPOINT_AUTH_METHODS = [
  'client_secret_post',
  'client_secret_basic',
  'client_secret_jwt',
];

export type ClientIdMetadataDocument = {
  name: string;
  redirectUris: string[];
  scopes: string[];
  logoUri: string | null;
  clientUri: string | null;
};

export const parseClientIdMetadataDocument = ({
  clientId,
  document,
}: {
  clientId: string;
  document: unknown;
}):
  | { valid: true; metadata: ClientIdMetadataDocument }
  | { valid: false; reason: string } => {
  if (!isPlainObject(document)) {
    return { valid: false, reason: 'Document is not a JSON object' };
  }

  const metadata: Record<string, unknown> = document;

  if (metadata.client_id !== clientId) {
    return {
      valid: false,
      reason: 'client_id does not match the document URL',
    };
  }

  // Shared secrets cannot be published in a public document
  if ('client_secret' in metadata || 'client_secret_expires_at' in metadata) {
    return {
      valid: false,
      reason: 'Document must not contain a client secret',
    };
  }

  const tokenEndpointAuthMethod = metadata.token_endpoint_auth_method;

  if (
    isString(tokenEndpointAuthMethod) &&
    CONFIDENTIAL_TOKEN_ENDPOINT_AUTH_METHODS.includes(tokenEndpointAuthMethod)
  ) {
    return {
      valid: false,
      reason: `Unsupported token_endpoint_auth_method: ${tokenEndpointAuthMethod}`,
    };
  }

  const redirectUris = metadata.redirect_uris;

  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length === 0 ||
    !redirectUris.every(
      (redirectUri) =>
        isString(redirectUri) && validateRedirectUri(redirectUri).valid,
    )
  ) {
    return { valid: false, reason: 'redirect_uris must be valid URIs' };
  }

  const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
  const scopes = isString(metadata.scope)
    ? metadata.scope.split(' ').filter((scope) => validScopes.includes(scope))
    : [...ALL_OAUTH_SCOPES];

  return {
    valid: true,
    metadata: {
      name: isNonEmptyString(metadata.client_name)
        ? metadata.client_name.slice(0, 256)
        : new URL(clientId).host,
      redirectUris: redirectUris as string[],
      scopes,
      logoUri: isNonEmptyString(metadata.logo_uri) ? metadata.logo_uri : null,
      clientUri: isNonEmptyString(metadata.client_uri)
        ? metadata.client_uri
        : null,
    },
  };
};
