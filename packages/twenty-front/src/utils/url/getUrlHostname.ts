import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';

export const getUrlHostname = (
  url: string,
  options?: { keepPath?: boolean },
) => {
  try {
    const parsedUrl = new URL(getAbsoluteUrl(url));
    return `${parsedUrl.hostname.replace(/^www\./i, '')}${options?.keepPath && parsedUrl.pathname !== '/' ? parsedUrl.pathname : ''}`;
  } catch {
    return '';
  }
};
