import { isUndefined } from '@sniptt/guards';

import { getMeetingEndTime } from 'src/logic-functions/domain/get-meeting-end-time.util';

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
  const meetingEndTime = getMeetingEndTime({
    startsAt,
    endsAt,
    startGraceHours,
  });

  return !isUndefined(meetingEndTime) && meetingEndTime <= now.getTime();
};
