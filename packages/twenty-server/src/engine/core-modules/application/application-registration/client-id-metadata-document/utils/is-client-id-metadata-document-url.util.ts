const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

// draft-ietf-oauth-client-id-metadata-document §3: an https URL with a path, no fragment, credentials or dot segments
export const isClientIdMetadataDocumentUrl = (clientId: string): boolean => {
  const url = parseUrl(clientId);

  return (
    url !== null &&
    url.protocol === 'https:' &&
    url.href === clientId &&
    url.pathname !== '/' &&
    url.hash === '' &&
    url.username === '' &&
    url.password === ''
  );
};
