import { parseDate } from './date-utils';

export function formatToHumanReadableDate(date: Date | string) {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedJSDate);
}

export function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

export function getLogoUrlFromDomainName(
  domainName?: string,
): string | undefined {
  const sanitizedDomain = sanitizeURL(domainName);

  if (!sanitizedDomain) return;

  for (const prefix of ['', 'www.', 'https://']) {
    const img = document.createElement('img');
    img.setAttribute(
      'src',
      `https://api.faviconkit.com/${prefix}${sanitizedDomain}/144`,
    );

    if (img.complete) {
      return img.src;
    }
  }

  return;
}
