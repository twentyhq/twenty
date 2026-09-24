import { isNonEmptyString } from '@sniptt/guards';

export const normalizeMeetingUrl = (
  meetingUrl: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(meetingUrl)) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(meetingUrl);

    parsedUrl.hash = '';
    parsedUrl.search = '';
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

    return parsedUrl.toString();
  } catch {
    return undefined;
  }
};
