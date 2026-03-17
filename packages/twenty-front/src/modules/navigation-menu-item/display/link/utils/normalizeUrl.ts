export const normalizeUrl = (url: string) => {
  const trimmedUrl = url.trim();

  if (trimmedUrl === '') {
    return trimmedUrl;
  }

  return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
    ? trimmedUrl
    : `https://${trimmedUrl}`;
};
