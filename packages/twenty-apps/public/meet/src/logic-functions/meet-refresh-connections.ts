import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MEET_USER_PROVIDER_NAME } from 'src/constants/meet.constant';
import {
  MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
  MEET_REFRESH_CONNECTIONS_UNIVERSAL_IDENTIFIER,
  MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { MEET_DAILY_JOB_SPREAD_MILLISECONDS } from 'src/logic-functions/constants/meet-import.constant';
import { enqueueMeetDailyJobsOrThrow } from 'src/logic-functions/utils/enqueue-meet-daily-jobs-or-throw.util';
import { getRandomDelayMilliseconds } from 'src/logic-functions/utils/get-random-delay-milliseconds.util';

export const meetRefreshConnectionsHandler = async (): Promise<{
  success: true;
  refreshedCount: number;
  reconnectRequiredCount: number;
}> => {
  const connections = await listConnections({
    providerName: MEET_USER_PROVIDER_NAME,
  });
  const connectedAccountIds = connections
    .filter(({ authFailedAt }) => !isDefined(authFailedAt))
    .map(({ id }) => id);
  const now = new Date();
  // Every workspace runs this cron at the same minute, so the work is spread over the hour.
  const delayMilliseconds = getRandomDelayMilliseconds(
    MEET_DAILY_JOB_SPREAD_MILLISECONDS,
  );

  await enqueueMeetDailyJobsOrThrow({
    logicFunctionUniversalIdentifier:
      MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
    jobName: 'renewal',
    connectedAccountIds,
    now,
    delayMilliseconds,
  });
  await enqueueMeetDailyJobsOrThrow({
    logicFunctionUniversalIdentifier:
      MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
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
  universalIdentifier: MEET_REFRESH_CONNECTIONS_UNIVERSAL_IDENTIFIER,
  name: 'meet-refresh-connections',
  description:
    'Once a day, renews the Google Meet event subscription of each connected Google account and imports the calls whose event was missed.',
  timeoutSeconds: 60,
  handler: meetRefreshConnectionsHandler,
  cronTriggerSettings: { pattern: '23 3 * * *' },
});
