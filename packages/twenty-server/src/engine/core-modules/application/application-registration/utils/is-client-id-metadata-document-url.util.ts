// draft-ietf-oauth-client-id-metadata-document §3: an HTTPS URL with a path, no fragment, credentials or dot segments
export const isClientIdMetadataDocumentUrl = (clientId: string): boolean => {
  if (!clientId.startsWith('https://')) {
    return false;
  }

  let parsed: URL;

  try {
    parsed = new URL(clientId);
  } catch {
    return false;
  }

  const pathSegments = clientId
    .slice(`https://${parsed.host}`.length)
    .split(/[?#]/)[0]
    .split('/');

  return (
    parsed.pathname !== '/' &&
    parsed.hash === '' &&
    parsed.username === '' &&
    parsed.password === '' &&
    !pathSegments.some((segment) => segment === '.' || segment === '..')
  );
};
