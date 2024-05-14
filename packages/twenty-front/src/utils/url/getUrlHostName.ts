import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';

export const getUrlHostName = (url: string) => {
  try {
    const absoluteUrl = getAbsoluteUrl(url);
    return new URL(absoluteUrl).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
};
