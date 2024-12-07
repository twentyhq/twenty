export const getImageAbsoluteURI = (imageUrl: string, serverUrl: string) => {
  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl;
  }

  return serverUrl.endsWith('/')
    ? `${serverUrl.substring(0, serverUrl.length - 1)}/files/${imageUrl}`
    : `${serverUrl}/files/${imageUrl}`;
};
