import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MEET_RECENT_CONFERENCE_WINDOW_MILLISECONDS } from 'src/logic-functions/constants/meet-import.constant';
import { enqueueMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-meet-conference-imports-or-throw.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { listMeetConferenceRecords } from 'src/logic-functions/utils/list-meet-conference-records.util';

type MeetQueueConferenceImportsResult =
  | { success: true; queuedCount: number; ongoingCount: number }
  | { success: false; error: string };

export const meetQueueConferenceImportsHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<MeetQueueConferenceImportsResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return {
      success: false,
      error: 'Invalid Google Meet conference discovery job',
    };
  }

  const now = new Date();
  const conferenceRecords = await listMeetConferenceRecords({
    accessToken: getConnectionAccessTokenOrThrow(
      await getConnection(connectedAccountId),
    ),
    startedAfter: new Date(
      now.getTime() - MEET_RECENT_CONFERENCE_WINDOW_MILLISECONDS,
    ),
    startedBefore: now,
  });
  const endedConferenceRecords = conferenceRecords.filter(({ endTime }) =>
    isNonEmptyString(endTime),
  );

  await enqueueMeetConferenceImportsOrThrow({
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
    MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
  name: 'meet-queue-conference-imports',
  description:
    'Finds the Google Meet conferences a connection finished in the last two days and queues one import per conference.',
  timeoutSeconds: 120,
  handler: meetQueueConferenceImportsHandler,
});
