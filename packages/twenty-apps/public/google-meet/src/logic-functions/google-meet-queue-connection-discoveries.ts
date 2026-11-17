import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_MEET_USER_PROVIDER_NAME } from 'src/constants/google-meet.constant';
import { GOOGLE_MEET_QUEUE_CONNECTION_DISCOVERIES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueGoogleMeetDiscoveriesOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util';

export const googleMeetQueueConnectionDiscoveriesHandler = async (): Promise<{
  success: true;
  queuedCount: number;
  reconnectRequiredCount: number;
}> => {
  const connections = await listConnections({
    providerName: GOOGLE_MEET_USER_PROVIDER_NAME,
  });
  const usableConnections = connections.filter(
    ({ authFailedAt }) => !isDefined(authFailedAt),
  );

  await enqueueGoogleMeetDiscoveriesOrThrow({
    connectedAccountIds: usableConnections.map(({ id }) => id),
    trigger: 'schedule',
    now: new Date(),
  });

  return {
    success: true,
    queuedCount: usableConnections.length,
    reconnectRequiredCount: connections.length - usableConnections.length,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    GOOGLE_MEET_QUEUE_CONNECTION_DISCOVERIES_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-queue-connection-discoveries',
  description:
    'Every hour, queues the discovery of recent Google Meet conferences for each connected Google account.',
  timeoutSeconds: 60,
  handler: googleMeetQueueConnectionDiscoveriesHandler,
  cronTriggerSettings: { pattern: '17 * * * *' },
});
