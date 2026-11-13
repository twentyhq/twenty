import { isClientIdMetadataDocumentUrl } from 'twenty-shared/application';
import { getUrlSafely } from 'twenty-shared/utils';

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
