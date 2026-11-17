import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_RECENT_CONFERENCE_WINDOW_MILLISECONDS } from 'src/logic-functions/constants/google-meet-import.constant';
import { enqueueGoogleMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-conference-imports-or-throw.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { listGoogleMeetConferenceRecords } from 'src/logic-functions/utils/list-google-meet-conference-records.util';

type GoogleMeetQueueConferenceImportsResult =
  | { success: true; queuedCount: number; ongoingCount: number }
  | { success: false; error: string };

export const googleMeetQueueConferenceImportsHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<GoogleMeetQueueConferenceImportsResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return {
      success: false,
      error: 'Invalid Google Meet conference discovery job',
    };
  }

  const now = new Date();
  const conferenceRecords = await listGoogleMeetConferenceRecords({
    accessToken: getConnectionAccessTokenOrThrow(
      await getConnection(connectedAccountId),
    ),
    startedAfter: new Date(
      now.getTime() - GOOGLE_MEET_RECENT_CONFERENCE_WINDOW_MILLISECONDS,
    ),
    startedBefore: now,
  });
  const endedConferenceRecords = conferenceRecords.filter(({ endTime }) =>
    isNonEmptyString(endTime),
  );

  await enqueueGoogleMeetConferenceImportsOrThrow({
    connectedAccountId,
    conferenceRecords: endedConferenceRecords,
    now,
  });

  return {
    success: true,
    queuedCount: endedConferenceRecords.length,
    ongoingCount: conferenceRecords.length - endedConferenceRecords.length,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-queue-conference-imports',
  description:
    'Finds the Google Meet conferences a connection finished in the last two days and queues one import per conference.',
  timeoutSeconds: 120,
  handler: googleMeetQueueConferenceImportsHandler,
});
