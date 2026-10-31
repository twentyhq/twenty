import { v5 } from 'uuid';

import { CLIENT_ID_METADATA_DOCUMENT_REGISTRATION_ID_NAMESPACE } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-registration-id-namespace.constant';
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';

export const toClientIdMetadataDocumentRegistrationFields = (
  clientIdMetadataDocument: ClientIdMetadataDocument,
) => ({
  id: v5(
    clientIdMetadataDocument.clientId,
    CLIENT_ID_METADATA_DOCUMENT_REGISTRATION_ID_NAMESPACE,
  ),
  name:
    clientIdMetadataDocument.clientName ??
    new URL(clientIdMetadataDocument.clientId).hostname,
  logo: clientIdMetadataDocument.logoUri,
  oAuthRedirectUris: clientIdMetadataDocument.redirectUris,
});
