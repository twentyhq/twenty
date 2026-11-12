import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { doRedirectUrisMatch } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/do-redirect-uris-match.util';

export const isRedirectUriListedInClientIdMetadataDocument = ({
  clientIdMetadataDocument,
  redirectUri,
}: {
  clientIdMetadataDocument: Pick<ClientIdMetadataDocument, 'redirectUris'>;
  redirectUri: string;
}): boolean =>
  clientIdMetadataDocument.redirectUris.some((registeredRedirectUri) =>
    doRedirectUrisMatch({ registeredRedirectUri, redirectUri }),
  );
