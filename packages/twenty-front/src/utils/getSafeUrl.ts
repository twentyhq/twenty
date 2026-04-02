import { isSafeUrl } from '~/utils/isSafeUrl';

// Returns the URL if already safe, otherwise tries prefixing https://
export const getSafeUrl = (url: string): string | undefined => {
  if (isSafeUrl(url)) {
    return url;
  }

  const withScheme = `https://${url}`;

  return isSafeUrl(withScheme) ? withScheme : undefined;
};
