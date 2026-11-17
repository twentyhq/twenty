import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, getConnection, kv } from 'twenty-sdk/logic-function';

import {
  GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_TRANSCRIPT_GENERATED_EVENT_TYPE } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetEventOutcome } from 'src/logic-functions/types/google-meet-event-outcome.type';
import { buildGoogleMeetTranscriptImportJob } from 'src/logic-functions/utils/build-google-meet-transcript-import-job.util';
import { getConferenceRecordNameFromTranscriptName } from 'src/logic-functions/utils/get-conference-record-name-from-transcript-name.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getGoogleMeetConferenceRecord } from 'src/logic-functions/utils/get-google-meet-conference-record.util';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';

type GoogleMeetHandleEventResult =
  | { success: true; outcome: GoogleMeetEventOutcome }
  | { success: false; error: string };

export const googleMeetHandleEventHandler = async ({
  subscriptionName,
  eventType,
  transcriptName,
}: {
  subscriptionName?: string;
  eventType?: string;
  transcriptName?: string;
}): Promise<GoogleMeetHandleEventResult> => {
  if (!isNonEmptyString(subscriptionName) || !isNonEmptyString(eventType)) {
    return { success: false, error: 'Invalid Google Meet event' };
  }

  if (eventType !== GOOGLE_MEET_TRANSCRIPT_GENERATED_EVENT_TYPE) {
    return { success: true, outcome: 'EVENT_TYPE_IGNORED' };
  }

  const conferenceRecordName = isNonEmptyString(transcriptName)
    ? getConferenceRecordNameFromTranscriptName(transcriptName)
    : undefined;

  if (
    !isNonEmptyString(transcriptName) ||
    !isNonEmptyString(conferenceRecordName)
  ) {
    return { success: false, error: 'Invalid Google Meet transcript event' };
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
      buildGoogleMeetTranscriptImportJob({
        connectedAccountId,
        conferenceRecord,
        transcriptName,
      }),
    ],
  });

  return { success: true, outcome: 'IMPORT_QUEUED' };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-handle-event',
  description:
    'Queues the import of a Google Meet conference when Google reports that its transcript is ready.',
  timeoutSeconds: 60,
  handler: googleMeetHandleEventHandler,
});
