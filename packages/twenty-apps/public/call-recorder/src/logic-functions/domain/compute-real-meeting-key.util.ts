import { isUndefined } from '@sniptt/guards';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ComputeRealMeetingKeyInput = {
  calendarEventId: string;
  conferenceLinkUrl: unknown;
  iCalUid: string | undefined;
  startsAt: string | undefined;
};

export const computeRealMeetingKey = ({
  calendarEventId,
  conferenceLinkUrl,
  iCalUid,
  startsAt,
}: ComputeRealMeetingKeyInput): string => {
  const normalizedConferenceLink = normalizeConferenceLink(conferenceLinkUrl);

  if (!isUndefined(normalizedConferenceLink)) {
    return `link:${normalizedConferenceLink}:${startsAt ?? ''}`;
  }

  if (isNonEmptyString(iCalUid)) {
    return `ical:${iCalUid}:${startsAt ?? ''}`;
  }

  return `event:${calendarEventId}`;
};

const normalizeConferenceLink = (
  conferenceLinkUrl: unknown,
): string | undefined => {
  if (!isNonEmptyString(conferenceLinkUrl)) {
    return undefined;
  }

  const withoutProtocol = conferenceLinkUrl
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  const withoutQueryAndFragment = withoutProtocol.split(/[?#]/)[0];
  const withoutTrailingSlash = withoutQueryAndFragment.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? undefined : withoutTrailingSlash;
};
