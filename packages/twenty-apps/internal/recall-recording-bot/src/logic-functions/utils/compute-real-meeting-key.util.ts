type ComputeRealMeetingKeyInput = {
  calendarEventId: string;
  conferenceLinkUrl: unknown;
  iCalUid: string | null;
  startsAt: string | null;
};

export const computeRealMeetingKey = ({
  calendarEventId,
  conferenceLinkUrl,
  iCalUid,
  startsAt,
}: ComputeRealMeetingKeyInput): string => {
  const normalizedConferenceLink = normalizeConferenceLink(conferenceLinkUrl);

  if (normalizedConferenceLink !== null) {
    return `link:${normalizedConferenceLink}:${startsAt ?? ''}`;
  }

  if (iCalUid !== null && iCalUid !== '') {
    return `ical:${iCalUid}:${startsAt ?? ''}`;
  }

  return `event:${calendarEventId}`;
};

const normalizeConferenceLink = (conferenceLinkUrl: unknown): string | null => {
  if (typeof conferenceLinkUrl !== 'string') {
    return null;
  }

  const trimmedConferenceLinkUrl = conferenceLinkUrl.trim();

  if (trimmedConferenceLinkUrl === '') {
    return null;
  }

  const withoutProtocol = trimmedConferenceLinkUrl
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  const withoutQueryAndFragment = withoutProtocol.split(/[?#]/)[0];
  const withoutTrailingSlash = withoutQueryAndFragment.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? null : withoutTrailingSlash;
};
