export const normalizeMeetingUrl = (
  meetingUrl: string | null | undefined,
): string | undefined => {
  if (!meetingUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(meetingUrl);

    parsedUrl.hash = '';
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, '');

    return parsedUrl.toString();
  } catch {
    return undefined;
  }
};
