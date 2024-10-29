import { isNonEmptyString } from '@sniptt/guards';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type GetImageAbsoluteURIReturnType<T> = T extends undefined | null | ''
  ? null
  : `http${string}`;

export const getImageAbsoluteURI = <T extends string | undefined | null>(
  imageUrl: T,
): GetImageAbsoluteURIReturnType<T> => {
  if (!imageUrl || !isNonEmptyString(imageUrl)) {
    return null as GetImageAbsoluteURIReturnType<T>;
  }

  if (imageUrl?.startsWith('https:') || imageUrl?.startsWith('http:')) {
    return imageUrl as GetImageAbsoluteURIReturnType<T>;
  }

  return `${REACT_APP_SERVER_BASE_URL}/files/${imageUrl}` as GetImageAbsoluteURIReturnType<T>;
};
