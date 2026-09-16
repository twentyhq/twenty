import { type Meeting } from '../types/Meeting';

export const getUpcomingMeetings = ({
  meetings,
  now,
}: {
  meetings: Meeting[];
  now: number;
}): Meeting[] =>
  meetings
    .filter((meeting) => Date.parse(meeting.endsAt) > now)
    .sort(
      (first, second) =>
        Date.parse(first.startsAt) - Date.parse(second.startsAt),
    );
