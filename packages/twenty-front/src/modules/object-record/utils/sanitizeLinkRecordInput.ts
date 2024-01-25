export const sanitizeLink = (url: string) => {
  const hostname = getUrlHostName(url) || getUrlHostName(`https://${url}`);
  return hostname.replace(/\/+$/, '').replace(/\?.*$/, '');
};

const getUrlHostName = (url: string) =>
  URL.canParse(url) ? new URL(url).hostname.replace(/^www\./i, '') : '';
