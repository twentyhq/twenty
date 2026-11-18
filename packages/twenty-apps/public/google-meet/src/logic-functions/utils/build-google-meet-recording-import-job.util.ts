import { createHash } from 'crypto';
import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

export const buildGoogleMeetRecordingImportJob = ({
  connectedAccountId,
  conferenceRecordName,
  recordingName,
}: {
  connectedAccountId: string;
  conferenceRecordName: string;
  recordingName: string;
}): EnqueueJobItem => ({
  jobId: `google-meet-recording-${createHash('sha256').update(recordingName).digest('hex')}`,
  payload: { connectedAccountId, conferenceRecordName, recordingName },
});
