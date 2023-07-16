import { parseDate } from './date-utils';

export function formatToHumanReadableDate(date: Date | string) {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedJSDate);
}

export const getLogoUrlFromDomainName = (domainName?: string): string => {
  return `https://api.faviconkit.com/${domainName}/144`;
};

export const browserPrefersDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
