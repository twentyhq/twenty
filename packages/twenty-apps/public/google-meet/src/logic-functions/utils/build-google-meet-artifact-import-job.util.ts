import { createHash } from 'crypto';
import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { buildGoogleMeetConferenceImportPayload } from 'src/logic-functions/utils/build-google-meet-conference-import-payload.util';

export const buildGoogleMeetArtifactImportJob = ({
  connectedAccountId,
  conferenceRecord,
  artifactName,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
  artifactName: string;
}): EnqueueJobItem => ({
  // One run per transcript or smart note: Pub/Sub can deliver the same event more than once.
  jobId: `google-meet-artifact-${createHash('sha256').update(artifactName).digest('hex')}`,
  payload: buildGoogleMeetConferenceImportPayload({
    connectedAccountId,
    conferenceRecord,
  }),
});
