import { type Meeting } from './types';

export const getMeetingUrl = (value: string): string => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Meeting links must use HTTPS.');
  }
  return url.href;
};

export const normalizeMeetingUrl = (value: string): string | null => {
  try {
    const url = new URL(getMeetingUrl(value));
    // Provider join tokens do not change the room; other query parameters can identify it.
    for (const key of ['pwd', 'authuser', 'hs', 'pli', 'utm_source'])
      url.searchParams.delete(key);
    url.searchParams.sort();
    if (url.hostname === 'www.zoom.us') url.hostname = 'zoom.us';
    return `${url.host.toLowerCase()}${url.pathname.replace(/\/$/, '')}${url.search}`;
  } catch {
    return null;
  }
};

export const matchMeeting = (
  meetings: Meeting[],
  url: string | undefined,
  now: number,
): Meeting | undefined => {
  const normalizedUrl = url ? normalizeMeetingUrl(url) : null;
  if (!normalizedUrl) return;
  const matches = meetings.filter(
    (meeting) =>
      meeting.url &&
      normalizeMeetingUrl(meeting.url) === normalizedUrl &&
      Date.parse(meeting.startsAt) - 15 * 60_000 <= now &&
      Date.parse(meeting.endsAt) + 15 * 60_000 >= now,
  );
  // Multiple calendar copies still reserve this room for its calendar recording policy.
  return (
    matches.find(
      (meeting) => meeting.usesCalendarBot || !meeting.recordingEnabled,
    ) ?? matches[0]
  );
};

export const getMeetingOccurrenceKey = (meeting: Meeting): string =>
  `${meeting.id}:${meeting.startsAt}`;

export const getDueMeetings = ({
  meetings,
  handledIds,
  now,
  lastSyncedAt,
}: {
  meetings: Meeting[];
  handledIds: ReadonlySet<string>;
  now: number;
  lastSyncedAt: number;
}): Meeting[] => {
  // A stale agenda must never open a canceled or moved meeting after wake or reconnection.
  if (
    !Number.isFinite(lastSyncedAt) ||
    now < lastSyncedAt ||
    now - lastSyncedAt > 90_000
  )
    return [];
  return meetings.filter(
    (meeting) =>
      meeting.url &&
      normalizeMeetingUrl(meeting.url) !== null &&
      !handledIds.has(getMeetingOccurrenceKey(meeting)) &&
      !handledIds.has(meeting.id) &&
      Date.parse(meeting.startsAt) <= now &&
      now - Date.parse(meeting.startsAt) < 60_000 &&
      Date.parse(meeting.endsAt) > now,
  );
};

export const getUpcomingMeetings = (
  meetings: Meeting[],
  now: number,
): Meeting[] =>
  meetings
    .filter((meeting) => Date.parse(meeting.endsAt) > now)
    .sort(
      (first, second) =>
        Date.parse(first.startsAt) - Date.parse(second.startsAt),
    );
