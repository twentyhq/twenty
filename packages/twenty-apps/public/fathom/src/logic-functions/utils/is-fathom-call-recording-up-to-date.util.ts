import { isNonEmptyString } from '@sniptt/guards';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';
import { isFathomCallRecordingImportComplete } from 'src/logic-functions/utils/is-fathom-call-recording-import-complete.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';
import { isDefined } from 'src/utils/is-defined';

const isAwaitingGeneratedTitle = ({
  meeting,
  storedTitle,
}: {
  meeting: Pick<
    SerializedFathomMeeting,
    'meetingTitle' | 'title' | 'recordingStartTime'
  >;
  storedTitle: string | undefined;
}): boolean => {
  const { title, impromptuTitle } = buildFathomCallRecordingTitle({
    meetingTitle: meeting.meetingTitle,
    title: meeting.title,
    recordingStartTime: new Date(meeting.recordingStartTime),
  });

  return isNonEmptyString(impromptuTitle) && storedTitle === title;
};

const isSameInstant = (
  persistedTimestamp: string | undefined,
  meetingTimestamp: string,
): boolean =>
  isNonEmptyString(persistedTimestamp) &&
  Date.parse(persistedTimestamp) === Date.parse(meetingTimestamp);

export const isFathomCallRecordingUpToDate = ({
  meeting,
  callRecording,
}: {
  meeting: Pick<
    SerializedFathomMeeting,
    | 'meetingUrl'
    | 'meetingTitle'
    | 'title'
    | 'recordingStartTime'
    | 'recordingEndTime'
  >;
  callRecording: Pick<
    CallRecordingSyncState,
    | 'isDeleted'
    | 'status'
    | 'title'
    | 'recordingRequestStatus'
    | 'startedAt'
    | 'endedAt'
    | 'calendarEventId'
    | 'fathomRecordingImportId'
    | 'hasTranscript'
    | 'hasSummary'
    | 'hasVideo'
    | 'hasAudio'
    | 'failureReason'
  >;
}): boolean =>
  !callRecording.isDeleted &&
  callRecording.status === 'COMPLETED' &&
  callRecording.recordingRequestStatus === 'REQUESTED' &&
  isNonEmptyString(callRecording.fathomRecordingImportId) &&
  isFathomCallRecordingImportComplete(callRecording) &&
  callRecording.hasSummary &&
  !isAwaitingGeneratedTitle({ meeting, storedTitle: callRecording.title }) &&
  isSameInstant(callRecording.startedAt, meeting.recordingStartTime) &&
  isSameInstant(callRecording.endedAt, meeting.recordingEndTime) &&
  (isNonEmptyString(callRecording.calendarEventId) ||
    !isDefined(normalizeMeetingUrl(meeting.meetingUrl)));
