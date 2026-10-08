import { randomBytes } from 'node:crypto';
import { isNonEmptyString } from '@sniptt/guards';

import { GRAPH_CREATED_CHANGE_TYPE } from 'src/features/transcripts/logic-functions/constants/graph-created-change-type';
import { TEAMS_TRANSCRIPT_SUBSCRIPTION_LIFETIME_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-subscription-lifetime-milliseconds';
import { type GraphSubscription } from 'src/features/transcripts/logic-functions/types/graph-subscription.type';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';

export const createTeamsTranscriptSubscription = async ({
  accessToken,
  notificationUrl,
}: {
  accessToken: string;
  notificationUrl: string;
}): Promise<TeamsTranscriptSubscription> => {
  const user = await fetchGraphJson<{ id?: unknown }>({
    accessToken,
    url: 'me?$select=id',
  });

  if (!isNonEmptyString(user.id)) {
    throw new Error('Microsoft Graph returned no user for the connection');
  }

  const clientState = randomBytes(32).toString('base64url');
  const subscription = await fetchGraphJson<GraphSubscription>({
    accessToken,
    url: 'subscriptions',
    method: 'POST',
    body: {
      changeType: GRAPH_CREATED_CHANGE_TYPE,
      notificationUrl,
      lifecycleNotificationUrl: notificationUrl,
      resource: `users/${user.id}/onlineMeetings/getAllTranscripts`,
      includeResourceData: false,
      expirationDateTime: new Date(
        Date.now() + TEAMS_TRANSCRIPT_SUBSCRIPTION_LIFETIME_MILLISECONDS,
      ).toISOString(),
      clientState,
    },
  });

  if (
    !isNonEmptyString(subscription.id) ||
    !isNonEmptyString(subscription.expirationDateTime)
  ) {
    throw new Error(
      'Microsoft Graph returned an invalid transcript subscription',
    );
  }

  return {
    subscriptionId: subscription.id,
    clientState,
    expirationDateTime: subscription.expirationDateTime,
  };
};
