import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getImageAbsoluteURIOrBase64 = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('data:') || imageUrl?.startsWith('https:')) {
    return imageUrl;
  }

  return `${REACT_APP_SERVER_BASE_URL}/files/${imageUrl}`;
};
