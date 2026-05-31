export const getIconMimeTypeFromUrl = (url: string): string => {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.endsWith('.svg')) {
    return 'image/svg+xml';
  }

  if (normalizedUrl.endsWith('.ico')) {
    return 'image/x-icon';
  }

  return 'image/png';
};

export const getManifestIconSizesForMimeType = (mimeType: string): string =>
  mimeType === 'image/svg+xml' ? 'any' : '192x192';

export const getManifestLargeIconSizesForMimeType = (
  mimeType: string,
): string => (mimeType === 'image/svg+xml' ? 'any' : '512x512');
