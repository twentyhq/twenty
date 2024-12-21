export const getImageAbsoluteURI = (
  imageUrl?: string | null,
  serverUrl?: string,
) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('https:')) {
    return imageUrl;
  }

  return serverUrl?.endsWith('/')
    ? `${serverUrl.substring(0, serverUrl.length - 1)}/files/${imageUrl}`
    : `${serverUrl || ''}/files/${imageUrl}`;
};
