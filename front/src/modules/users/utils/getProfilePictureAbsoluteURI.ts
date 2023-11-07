import { REACT_APP_SERVER_FILES_URL } from '~/config';

export const getImageAbsoluteURIOrBase64 = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('data:')) {
    return imageUrl;
  }

  if (imageUrl?.startsWith('https:')) {
    return imageUrl;
  }

  const serverFilesUrl = REACT_APP_SERVER_FILES_URL;

  return `${serverFilesUrl}/${imageUrl}`;
};
