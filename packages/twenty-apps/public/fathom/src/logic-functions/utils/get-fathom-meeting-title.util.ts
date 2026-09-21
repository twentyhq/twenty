import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

export const getFathomMeetingTitle = (
  meeting: Pick<Meeting, 'meetingTitle' | 'title'>,
): string => {
  const meetingTitle = meeting.meetingTitle?.trim();

  return isNonEmptyString(meetingTitle) ? meetingTitle : meeting.title.trim();
};
