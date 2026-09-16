import { getMeetingUrl } from './getMeetingUrl';

export const normalizeMeetingUrl = (value: string): string | null => {
  try {
    const url = new URL(getMeetingUrl(value));
    // Provider join tokens do not change the room; other query parameters can identify it.
    for (const key of ['pwd', 'authuser', 'hs', 'pli', 'utm_source'])
      url.searchParams.delete(key);
    url.searchParams.sort();
    if (url.hostname === 'www.zoom.us') {
      url.hostname = 'zoom.us';
    }
    return `${url.host.toLowerCase()}${url.pathname.replace(/\/$/, '')}${url.search}`;
  } catch {
    return null;
  }
};
