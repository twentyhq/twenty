import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getImageAbsoluteURI = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('https:') || imageUrl?.startsWith('http:')) {
    return imageUrl;
  }

  const serverFilesUrl = REACT_APP_SERVER_BASE_URL;

  return `${serverFilesUrl}/files/${imageUrl}`;
};
