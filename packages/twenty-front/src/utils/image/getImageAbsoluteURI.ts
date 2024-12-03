import { REACT_APP_SERVER_BASE_URL } from '~/config';

type ImageAbsoluteURI<T extends string | null | undefined> = T extends string
  ? string
  : null;

export const getImageAbsoluteURI = <T extends string | null | undefined>(
  imageUrl: T,
): ImageAbsoluteURI<T> => {
  if (!imageUrl) {
    return null as ImageAbsoluteURI<T>;
  }

  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl as ImageAbsoluteURI<T>;
  }

  const serverFilesUrl = REACT_APP_SERVER_BASE_URL;

  return `${serverFilesUrl}/files/${imageUrl}` as ImageAbsoluteURI<T>;
};