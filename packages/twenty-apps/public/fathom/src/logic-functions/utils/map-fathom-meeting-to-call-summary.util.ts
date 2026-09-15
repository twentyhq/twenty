import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { type FathomCallSummary } from 'src/logic-functions/types/fathom-call-summary.type';
import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';

const MILLISECONDS_PER_MINUTE = 60_000;

export const mapFathomMeetingToCallSummary = (
  meeting: Meeting,
): FathomCallSummary => ({
  recordingId: meeting.recordingId,
  title: getFathomMeetingTitle(meeting),
  startedAt: meeting.recordingStartTime.toISOString(),
  durationMinutes: Math.round(
    (meeting.recordingEndTime.getTime() -
      meeting.recordingStartTime.getTime()) /
      MILLISECONDS_PER_MINUTE,
  ),
  participants: meeting.calendarInvitees
    .map((invitee) => invitee.email)
    .filter(isNonEmptyString),
  recordedBy: meeting.recordedBy.email,
  fathomUrl: meeting.url,
  ...(isNonEmptyString(meeting.meetingUrl)
    ? { meetingUrl: meeting.meetingUrl }
    : {}),
});
