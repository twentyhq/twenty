import { getUrlSafely } from 'twenty-shared/utils';

import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { isLoopbackHostname } from 'src/engine/core-modules/auth/utils/is-loopback-hostname.util';

// The URL is chosen by an unauthenticated client; the HTTP client also refuses private addresses after DNS resolution
export const isAllowedClientIdMetadataDocumentFetchUrl = (
  clientIdMetadataDocumentUrl: string,
): boolean => {
  const url = getUrlSafely(clientIdMetadataDocumentUrl);

  return (
    isClientIdMetadataDocumentUrl(clientIdMetadataDocumentUrl) &&
    url?.port === '' &&
    !isLoopbackHostname(url.hostname)
  );
};
