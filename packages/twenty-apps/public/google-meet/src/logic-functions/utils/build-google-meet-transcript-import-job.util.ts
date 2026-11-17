import { createHash } from 'crypto';
import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { buildGoogleMeetConferenceImportPayload } from 'src/logic-functions/utils/build-google-meet-conference-import-payload.util';

export const buildGoogleMeetTranscriptImportJob = ({
  connectedAccountId,
  conferenceRecord,
  transcriptName,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
  transcriptName: string;
}): EnqueueJobItem => ({
  // One run per transcript: Pub/Sub can deliver the same event more than once.
  jobId: `google-meet-transcript-${createHash('sha256').update(transcriptName).digest('hex')}`,
  payload: buildGoogleMeetConferenceImportPayload({
    connectedAccountId,
    conferenceRecord,
  }),
});
