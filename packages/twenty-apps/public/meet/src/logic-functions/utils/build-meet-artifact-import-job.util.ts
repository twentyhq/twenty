import { createHash } from 'crypto';
import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { buildMeetConferenceImportPayload } from 'src/logic-functions/utils/build-meet-conference-import-payload.util';

export const buildMeetArtifactImportJob = ({
  connectedAccountId,
  conferenceRecord,
  artifactName,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    MeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
  artifactName: string;
}): EnqueueJobItem => ({
  // One run per transcript or smart note: Pub/Sub can deliver the same event more than once.
  jobId: `google-meet-artifact-${createHash('sha256').update(artifactName).digest('hex')}`,
  payload: buildMeetConferenceImportPayload({
    connectedAccountId,
    conferenceRecord,
  }),
});
