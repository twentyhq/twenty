import { type Meeting } from '../types/Meeting';
import { normalizeMeetingUrl } from './normalizeMeetingUrl';

export const matchMeeting = ({
  meetings,
  url,
  now,
}: {
  meetings: Meeting[];
  url: string | undefined;
  now: number;
}): Meeting | undefined => {
  const normalizedUrl = url ? normalizeMeetingUrl(url) : null;
  if (!normalizedUrl) {
    return;
  }
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
