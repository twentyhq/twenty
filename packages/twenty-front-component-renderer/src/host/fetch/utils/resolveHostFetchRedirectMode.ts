export const resolveHostFetchRedirectMode = (
  requestMethod: string,
  requestUrl: string,
  fileStorageRedirectableUrls: Set<string>,
): RequestRedirect => {
  const isReadOnlyMethod = requestMethod === 'GET' || requestMethod === 'HEAD';

  return isReadOnlyMethod && fileStorageRedirectableUrls.has(requestUrl)
    ? 'follow'
    : 'error';
};
