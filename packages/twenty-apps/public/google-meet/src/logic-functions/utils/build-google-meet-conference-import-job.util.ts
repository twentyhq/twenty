import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_HOUR } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';

export const buildGoogleMeetConferenceImportJob = ({
  connectedAccountId,
  conferenceRecord,
  now,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
  now: Date;
}): EnqueueJobItem => ({
  // One run per conference and hour: a transcript published late is picked up by a later hour.
  jobId: `google-meet-conference-${computeCallRecordingIdForGoogleMeetConference(conferenceRecord.name)}-${Math.floor(now.getTime() / MILLISECONDS_PER_HOUR)}`,
  payload: {
    connectedAccountId,
    conferenceRecordName: conferenceRecord.name,
    startTime: conferenceRecord.startTime,
    endTime: conferenceRecord.endTime,
    spaceName: conferenceRecord.space,
  },
});
