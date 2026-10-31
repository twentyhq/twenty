import { getUrlSafely } from 'twenty-shared/utils';

// draft-ietf-oauth-client-id-metadata-document §3: an https URL with a path and no fragment
export const isClientIdMetadataDocumentUrl = (clientId: string): boolean => {
  const url = getUrlSafely(clientId);

  return (
    url?.protocol === 'https:' &&
    url.pathname !== '/' &&
    url.hash === '' &&
    url.username === '' &&
    url.password === ''
  );
};
