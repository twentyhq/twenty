import { isNonEmptyString, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import {
  ALL_OAUTH_SCOPES,
  type OAuthScope,
} from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';

export type ClientIdMetadataDocument = {
  clientName: string;
  redirectUris: string[];
  scopes: OAuthScope[];
  logoUri: string | null;
};

const SUPPORTED_TOKEN_ENDPOINT_AUTH_METHODS = ['none'];

const isOAuthScope = (scope: string): scope is OAuthScope =>
  (ALL_OAUTH_SCOPES as readonly string[]).includes(scope);

export const parseClientIdMetadataDocument = (
  document: unknown,
  clientId: string,
): ClientIdMetadataDocument | null => {
  if (!isPlainObject(document) || document.client_id !== clientId) {
    return null;
  }

  if ('client_secret' in document) {
    return null;
  }

  const tokenEndpointAuthMethod = document.token_endpoint_auth_method ?? 'none';

  if (
    !isString(tokenEndpointAuthMethod) ||
    !SUPPORTED_TOKEN_ENDPOINT_AUTH_METHODS.includes(tokenEndpointAuthMethod)
  ) {
    return null;
  }

  const redirectUris = document.redirect_uris;

  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length === 0 ||
    !redirectUris.every(
      (uri) => isString(uri) && validateRedirectUri(uri).valid,
    )
  ) {
    return null;
  }

  const scopes = isString(document.scope)
    ? document.scope.split(' ').filter(isOAuthScope)
    : [...ALL_OAUTH_SCOPES];

  const logoUri =
    isString(document.logo_uri) && document.logo_uri.startsWith('https://')
      ? document.logo_uri
      : null;

  return {
    clientName: isNonEmptyString(document.client_name)
      ? document.client_name
      : new URL(clientId).host,
    redirectUris,
    scopes,
    logoUri,
  };
};
