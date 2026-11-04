import { getUrlSafely } from 'twenty-shared/utils';

export const isClientIdMetadataDocumentUrl = (clientId: string): boolean => {
  const url = getUrlSafely(clientId);

  return (
    url?.protocol === 'https:' &&
    url.pathname !== '/' &&
    !clientId.includes('#') &&
    url.username === '' &&
    url.password === ''
  );
};
