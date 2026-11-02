import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';
import { findWellKnownOAuthClientByRedirectUris } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-redirect-uris.util';

// Host and callbacks must both be the vendor's: Claude Code is also published on claude.ai but uses loopback callbacks
export const findWellKnownOAuthClientByClientIdMetadataDocument = (
  clientIdMetadataDocument: Pick<
    ClientIdMetadataDocument,
    'clientId' | 'redirectUris'
  >,
): WellKnownOAuthClientDefinition | undefined => {
  const wellKnownOAuthClient = findWellKnownOAuthClientByRedirectUris(
    clientIdMetadataDocument.redirectUris,
  );
  const clientIdHostname = new URL(clientIdMetadataDocument.clientId).hostname;

  return wellKnownOAuthClient?.clientIdMetadataDocumentHostnames.includes(
    clientIdHostname,
  )
    ? wellKnownOAuthClient
    : undefined;
};
