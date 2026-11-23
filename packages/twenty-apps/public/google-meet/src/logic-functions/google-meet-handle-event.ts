import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, getConnection, kv } from 'twenty-sdk/logic-function';

import {
  GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_EVENT_TYPES } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetEventOutcome } from 'src/logic-functions/types/google-meet-event-outcome.type';
import { buildGoogleMeetArtifactImportJob } from 'src/logic-functions/utils/build-google-meet-artifact-import-job.util';
import { getConferenceRecordNameFromArtifactName } from 'src/logic-functions/utils/get-conference-record-name-from-artifact-name.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getGoogleMeetConferenceRecord } from 'src/logic-functions/utils/get-google-meet-conference-record.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

type GoogleMeetHandleEventResult =
  | { success: true; outcome: GoogleMeetEventOutcome }
  | { success: false; error: string };

export const googleMeetHandleEventHandler = async ({
  subscriptionName,
  eventType,
  artifactName,
}: {
  subscriptionName?: string;
  eventType?: string;
  artifactName?: string;
}): Promise<GoogleMeetHandleEventResult> => {
  if (!isNonEmptyString(subscriptionName) || !isNonEmptyString(eventType)) {
    return { success: false, error: 'Invalid Google Meet event' };
  }

  if (!GOOGLE_MEET_EVENT_TYPES.includes(eventType)) {
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
    getGoogleMeetEventSubscriptionKey(subscriptionName),
  );

  if (!isNonEmptyString(connectedAccountId)) {
    return { success: true, outcome: 'SUBSCRIPTION_WITHOUT_CONNECTION' };
  }

  const conferenceRecord = await getGoogleMeetConferenceRecord({
    accessToken: getConnectionAccessTokenOrThrow(
      await getConnection(connectedAccountId),
    ),
    conferenceRecordName,
  });

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
    jobs: [
      buildGoogleMeetArtifactImportJob({
        connectedAccountId,
        conferenceRecord,
        artifactName,
      }),
    ],
  });

  return { success: true, outcome: 'IMPORT_QUEUED' };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-handle-event',
  description:
    'Queues the import of a Google Meet conference when Google reports that its transcript, Gemini notes or recording is ready.',
  timeoutSeconds: 60,
  handler: googleMeetHandleEventHandler,
});
