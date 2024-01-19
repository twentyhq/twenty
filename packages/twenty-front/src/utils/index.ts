import { parseDate } from './date-utils';

export const formatToHumanReadableDate = (
  date: Date | string,
  locales: string = 'fa-IR',
) => {
  const parsedJSDate = parseDate(date).toJSDate();
  return new Intl.DateTimeFormat(locales, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedJSDate);
};

export const sanitizeURL = (link: string | null | undefined) => {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
};

export const getLogoUrlFromDomainName = (
  domainName?: string,
): string | undefined => {
  const sanitizedDomain = sanitizeURL(domainName);
  return `https://favicon.twenty.com/${sanitizedDomain}`;
};
