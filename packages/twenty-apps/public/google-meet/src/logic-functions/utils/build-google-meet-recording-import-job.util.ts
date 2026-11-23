import { createHash } from 'crypto';
import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_HOUR } from 'src/logic-functions/constants/google-meet-import.constant';

export const buildGoogleMeetRecordingImportJob = ({
  connectedAccountId,
  conferenceRecordName,
  recordingName,
  now,
}: {
  connectedAccountId: string;
  conferenceRecordName: string;
  recordingName: string;
  now: Date;
}): EnqueueJobItem => ({
  // One run per recording and hour: the queue keeps a failed job for days, so a fixed id would block later retries.
  jobId: `google-meet-recording-${createHash('sha256').update(recordingName).digest('hex')}-${Math.floor(now.getTime() / MILLISECONDS_PER_HOUR)}`,
  payload: { connectedAccountId, conferenceRecordName, recordingName },
});
