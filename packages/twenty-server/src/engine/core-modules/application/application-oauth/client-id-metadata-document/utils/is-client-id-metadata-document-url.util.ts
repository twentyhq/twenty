// draft-ietf-oauth-client-id-metadata-document §3: an https URL with a path and no fragment
export const isClientIdMetadataDocumentUrl = (clientId: string): boolean => {
  let url: URL;

  try {
    url = new URL(clientId);
  } catch {
    return false;
  }

  return (
    url.protocol === 'https:' &&
    url.pathname !== '/' &&
    url.hash === '' &&
    url.username === '' &&
    url.password === ''
  );
};
