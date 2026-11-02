import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';

export const toClientIdMetadataDocumentRegistrationFields = (
  clientIdMetadataDocument: ClientIdMetadataDocument,
) => ({
  name:
    clientIdMetadataDocument.clientName ??
    new URL(clientIdMetadataDocument.clientId).hostname,
  logo: clientIdMetadataDocument.logoUri,
  oAuthRedirectUris: clientIdMetadataDocument.redirectUris,
});
