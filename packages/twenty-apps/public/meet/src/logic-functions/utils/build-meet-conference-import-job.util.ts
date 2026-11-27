import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_HOUR } from 'src/logic-functions/constants/meet-import.constant';
import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { buildMeetConferenceImportPayload } from 'src/logic-functions/utils/build-meet-conference-import-payload.util';
import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';

export const buildMeetConferenceImportJob = ({
  connectedAccountId,
  conferenceRecord,
  now,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    MeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
  now: Date;
}): EnqueueJobItem => ({
  // One run per conference and hour: a transcript published late is picked up by a later hour.
  jobId: `google-meet-conference-${computeCallRecordingIdForMeetConference(conferenceRecord.name)}-${Math.floor(now.getTime() / MILLISECONDS_PER_HOUR)}`,
  payload: buildMeetConferenceImportPayload({
    connectedAccountId,
    conferenceRecord,
  }),
});
