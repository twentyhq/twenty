import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';

const IMPROMPTU_MEETING_TITLE_PATTERN =
  /^impromptu(?:\s+(?:zoom|google meet|microsoft teams|slack huddle))?(?:\s+(?:meeting|call))?$/i;

export const buildFathomCallRecordingTitle = (
  meeting: Pick<Meeting, 'meetingTitle' | 'title' | 'recordingStartTime'>,
): { title: string; impromptuTitle?: string } => {
  const title = getFathomMeetingTitle(meeting);

  if (!IMPROMPTU_MEETING_TITLE_PATTERN.test(title)) {
    return { title };
  }

  const recordingTitle = meeting.title.trim();

  if (
    isNonEmptyString(recordingTitle) &&
    !IMPROMPTU_MEETING_TITLE_PATTERN.test(recordingTitle)
  ) {
    return { title: recordingTitle };
  }

  const recordingDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(meeting.recordingStartTime);

  return {
    title: `${title} (${recordingDate} UTC)`,
    impromptuTitle: title,
  };
};
