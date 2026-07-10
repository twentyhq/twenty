export const isTextContentType = (contentType: string): boolean => {
  const mimeType = contentType.split(';')[0].trim().toLowerCase();

  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/x-www-form-urlencoded' ||
    mimeType === 'application/graphql' ||
    mimeType.endsWith('json') ||
    mimeType.endsWith('xml')
  );
};
