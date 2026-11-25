import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, getConnection, kv } from 'twenty-sdk/logic-function';

import {
  MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { MEET_EVENT_TYPES } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type MeetEventOutcome } from 'src/logic-functions/types/meet-event-outcome.type';
import { buildMeetArtifactImportJob } from 'src/logic-functions/utils/build-meet-artifact-import-job.util';
import { getConferenceRecordNameFromArtifactName } from 'src/logic-functions/utils/get-conference-record-name-from-artifact-name.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getMeetConferenceRecord } from 'src/logic-functions/utils/get-meet-conference-record.util';
import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';

type MeetHandleEventResult =
  | { success: true; outcome: MeetEventOutcome }
  | { success: false; error: string };

export const meetHandleEventHandler = async ({
  subscriptionName,
  eventType,
  artifactName,
}: {
  subscriptionName?: string;
  eventType?: string;
  artifactName?: string;
}): Promise<MeetHandleEventResult> => {
  if (!isNonEmptyString(subscriptionName) || !isNonEmptyString(eventType)) {
    return { success: false, error: 'Invalid Google Meet event' };
  }

  if (!MEET_EVENT_TYPES.includes(eventType)) {
    return { success: true, outcome: 'EVENT_TYPE_IGNORED' };
  }

  const conferenceRecordName = isNonEmptyString(artifactName)
    ? getConferenceRecordNameFromArtifactName(artifactName)
    : undefined;

  if (
    !isNonEmptyString(artifactName) ||
    !isNonEmptyString(conferenceRecordName)
  ) {
    return { success: false, error: 'Invalid Google Meet artifact event' };
  }

  const connectedAccountId = await kv.get<string>(
    getMeetEventSubscriptionKey(subscriptionName),
  );

  if (!isNonEmptyString(connectedAccountId)) {
    return { success: true, outcome: 'SUBSCRIPTION_WITHOUT_CONNECTION' };
  }

  const conferenceRecord = await getMeetConferenceRecord({
    accessToken: getConnectionAccessTokenOrThrow(
      await getConnection(connectedAccountId),
    ),
    conferenceRecordName,
  });

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
    jobs: [
      buildMeetArtifactImportJob({
        connectedAccountId,
        conferenceRecord,
        artifactName,
      }),
    ],
  });

  return { success: true, outcome: 'IMPORT_QUEUED' };
};

export default defineLogicFunction({
  universalIdentifier: MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'meet-handle-event',
  description:
    'Queues the import of a Google Meet conference when Google reports that its transcript, Gemini notes or recording is ready.',
  timeoutSeconds: 60,
  handler: meetHandleEventHandler,
});
