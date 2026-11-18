import { isDefined } from 'twenty-shared/utils';

import { findVerifiedOAuthClientForClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-client-id-metadata-document-url.util';

export const isVerifiedOAuthClientIdMetadataDocumentUrl = (
  clientId: string,
): boolean =>
  isDefined(findVerifiedOAuthClientForClientIdMetadataDocumentUrl(clientId));
