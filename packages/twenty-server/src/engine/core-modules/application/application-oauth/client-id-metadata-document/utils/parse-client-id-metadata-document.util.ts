import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';

const SHARED_SECRET_FIELDS = ['client_secret', 'client_secret_expires_at'];

export const parseClientIdMetadataDocument = ({
  clientIdMetadataDocumentUrl,
  rawDocument,
}: {
  clientIdMetadataDocumentUrl: string;
  rawDocument: unknown;
}): { document: ClientIdMetadataDocument } | { error: string } => {
  if (!isPlainObject(rawDocument)) {
    return { error: 'The document is not a JSON object' };
  }

  if (rawDocument.client_id !== clientIdMetadataDocumentUrl) {
    return { error: 'client_id does not match the document URL' };
  }

  if (SHARED_SECRET_FIELDS.some((field) => field in rawDocument)) {
    return { error: 'The document must not carry a shared secret' };
  }

  // Only public clients are supported. ChatGPT prefers private_key_jwt but also lists "none",
  // which it falls back to since this server only advertises "none"
  const tokenEndpointAuthMethod = rawDocument.token_endpoint_auth_method;
  const tokenEndpointAuthMethodsSupported =
    rawDocument.token_endpoint_auth_methods_supported;
  const canAuthenticateAsPublicClient =
    !isDefined(tokenEndpointAuthMethod) ||
    tokenEndpointAuthMethod === 'none' ||
    (Array.isArray(tokenEndpointAuthMethodsSupported) &&
      tokenEndpointAuthMethodsSupported.includes('none'));

  if (!canAuthenticateAsPublicClient) {
    return {
      error: `Unsupported token_endpoint_auth_method: ${String(tokenEndpointAuthMethod)}`,
    };
  }

  const redirectUris = rawDocument.redirect_uris;

  if (
    !Array.isArray(redirectUris) ||
    !isNonEmptyArray(redirectUris) ||
    !redirectUris.every(isString)
  ) {
    return { error: 'redirect_uris must be a non-empty list of URLs' };
  }

  for (const redirectUri of redirectUris) {
    const redirectUriValidation = validateRedirectUri(redirectUri);

    if (!redirectUriValidation.valid) {
      return { error: redirectUriValidation.reason };
    }
  }

  const clientName = rawDocument.client_name;
  const logoUri = rawDocument.logo_uri;

  return {
    document: {
      clientId: clientIdMetadataDocumentUrl,
      clientName: isNonEmptyString(clientName) ? clientName : null,
      logoUri:
        isNonEmptyString(logoUri) && logoUri.startsWith('https://')
          ? logoUri
          : null,
      redirectUris,
    },
  };
};
