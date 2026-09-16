import { type Meeting } from '../types/Meeting';
import { normalizeMeetingUrl } from './normalizeMeetingUrl';
import { getMeetingOccurrenceKey } from './getMeetingOccurrenceKey';

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
  ) {
    return [];
  }
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
