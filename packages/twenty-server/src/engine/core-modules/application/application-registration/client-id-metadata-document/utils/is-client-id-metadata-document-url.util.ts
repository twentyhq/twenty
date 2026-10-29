const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

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
