import { isUndefined } from '@sniptt/guards';

export const getMeetingEndTime = ({
  startsAt,
  endsAt,
  startGraceHours = 0,
}: {
  startsAt: string | undefined;
  endsAt: string | undefined;
  startGraceHours?: number;
}): number | undefined => {
  if (!isUndefined(endsAt)) {
    const meetingEndTime = new Date(endsAt).getTime();

    if (!Number.isNaN(meetingEndTime)) {
      return meetingEndTime;
    }
  }

  if (isUndefined(startsAt)) {
    return undefined;
  }

  const meetingStartTime = new Date(startsAt).getTime();

  if (Number.isNaN(meetingStartTime)) {
    return undefined;
  }

  return meetingStartTime + startGraceHours * 60 * 60 * 1000;
};
