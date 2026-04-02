import { isSafeUrl } from '~/utils/isSafeUrl';

export const getSafeUrl = (url: string): string | undefined => {
  if (isSafeUrl(url)) {
    return url;
  }

  const withScheme = `https://${url}`;

  return isSafeUrl(withScheme) ? withScheme : undefined;
};
