import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_TRANSCRIPT_SUBSCRIPTION_LIFETIME_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-subscription-lifetime-milliseconds';
import { type GraphSubscription } from 'src/features/transcripts/logic-functions/types/graph-subscription.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';

export const renewTeamsTranscriptSubscription = async ({
  accessToken,
  subscriptionId,
}: {
  accessToken: string;
  subscriptionId: string;
}): Promise<string> => {
  const subscription = await fetchGraphJson<GraphSubscription>({
    accessToken,
    url: `subscriptions/${encodeURIComponent(subscriptionId)}`,
    method: 'PATCH',
    body: {
      expirationDateTime: new Date(
        Date.now() + TEAMS_TRANSCRIPT_SUBSCRIPTION_LIFETIME_MILLISECONDS,
      ).toISOString(),
    },
  });

  if (!isNonEmptyString(subscription.expirationDateTime)) {
    throw new Error(
      'Microsoft Graph returned an invalid transcript subscription',
    );
  }

  return subscription.expirationDateTime;
};
