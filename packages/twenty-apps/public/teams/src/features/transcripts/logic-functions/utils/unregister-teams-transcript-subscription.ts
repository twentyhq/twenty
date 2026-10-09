import { getConnection, kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { buildTeamsTranscriptSubscriptionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-subscription-kv-key';
import { buildTeamsTranscriptsConnectionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcripts-connection-kv-key';
import { deleteTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-subscription';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

export const unregisterTeamsTranscriptSubscription = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ deletedTranscriptSubscriptionId: string | null }> => {
  const subscriptionKvKey =
    buildTeamsTranscriptSubscriptionKvKey(connectedAccountId);
  const connectionKvKey =
    buildTeamsTranscriptsConnectionKvKey(connectedAccountId);
  const subscription =
    await kv.get<TeamsTranscriptSubscription>(subscriptionKvKey);

  if (!isDefined(subscription)) {
    await kv.delete(connectionKvKey, { scope: 'SERVER' });

    return { deletedTranscriptSubscriptionId: null };
  }

  try {
    const { accessToken } = await getConnection(connectedAccountId);

    await deleteTeamsTranscriptSubscription({
      accessToken,
      subscriptionId: subscription.subscriptionId,
    });
  } catch (error) {
    console.error(
      `[teams] leaked transcript subscription ${subscription.subscriptionId} for connected account ${connectedAccountId}: ${toErrorMessage(error)}`,
    );

    throw error;
  } finally {
    await kv.delete(subscriptionKvKey);
    await kv.delete(connectionKvKey, { scope: 'SERVER' });
  }

  return { deletedTranscriptSubscriptionId: subscription.subscriptionId };
};
