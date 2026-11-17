import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_MEET_USER_PROVIDER_NAME } from 'src/constants/google-meet.constant';
import {
  GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_REFRESH_CONNECTIONS_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_DAILY_JOB_SPREAD_MILLISECONDS } from 'src/logic-functions/constants/google-meet-import.constant';
import { enqueueGoogleMeetDailyJobsOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-daily-jobs-or-throw.util';
import { getRandomDelayMilliseconds } from 'src/logic-functions/utils/get-random-delay-milliseconds.util';

export const googleMeetRefreshConnectionsHandler = async (): Promise<{
  success: true;
  refreshedCount: number;
  reconnectRequiredCount: number;
}> => {
  const connections = await listConnections({
    providerName: GOOGLE_MEET_USER_PROVIDER_NAME,
  });
  const connectedAccountIds = connections
    .filter(({ authFailedAt }) => !isDefined(authFailedAt))
    .map(({ id }) => id);
  const now = new Date();
  // Every workspace runs this cron at the same minute, so the work is spread over the hour.
  const delayMilliseconds = getRandomDelayMilliseconds(
    GOOGLE_MEET_DAILY_JOB_SPREAD_MILLISECONDS,
  );

  await enqueueGoogleMeetDailyJobsOrThrow({
    logicFunctionUniversalIdentifier:
      GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
    jobName: 'renewal',
    connectedAccountIds,
    now,
    delayMilliseconds,
  });
  await enqueueGoogleMeetDailyJobsOrThrow({
    logicFunctionUniversalIdentifier:
      GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
    jobName: 'catch-up',
    connectedAccountIds,
    now,
    delayMilliseconds,
  });

  return {
    success: true,
    refreshedCount: connectedAccountIds.length,
    reconnectRequiredCount: connections.length - connectedAccountIds.length,
  };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_REFRESH_CONNECTIONS_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-refresh-connections',
  description:
    'Once a day, renews the Google Meet event subscription of each connected Google account and imports the calls whose event was missed.',
  timeoutSeconds: 60,
  handler: googleMeetRefreshConnectionsHandler,
  cronTriggerSettings: { pattern: '23 3 * * *' },
});
