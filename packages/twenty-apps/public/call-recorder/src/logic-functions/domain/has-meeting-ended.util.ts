import { isUndefined } from '@sniptt/guards';

export const hasMeetingEnded = ({
  startsAt,
  endsAt,
  now,
  startGraceHours = 0,
}: {
  startsAt: string | undefined;
  endsAt: string | undefined;
  now: Date;
  startGraceHours?: number;
}): boolean => {
  if (!isUndefined(endsAt)) {
    const meetingEndTime = new Date(endsAt).getTime();

    if (!Number.isNaN(meetingEndTime)) {
      return meetingEndTime <= now.getTime();
    }
  }

  if (isUndefined(startsAt)) {
    return false;
  }

  const meetingStartTime = new Date(startsAt).getTime();

  return (
    !Number.isNaN(meetingStartTime) &&
    meetingStartTime + startGraceHours * 60 * 60 * 1000 <= now.getTime()
  );
};
