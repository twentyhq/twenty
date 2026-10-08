import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv, listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { buildTeamsTranscriptSubscriptionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-subscription-kv-key';
import { buildTeamsTranscriptsConnectionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcripts-connection-kv-key';
import { buildTeamsTranscriptsWebhookUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-transcripts-webhook-url';
import { createTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/create-teams-transcript-subscription';
import { deleteTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-subscription';
import { renewTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/renew-teams-transcript-subscription';
import { unregisterTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/unregister-teams-transcript-subscription';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

const renewStoredSubscriptionOrUndefined = async ({
  accessToken,
  subscriptionKvKey,
  subscription,
}: {
  accessToken: string;
  subscriptionKvKey: string;
  subscription: TeamsTranscriptSubscription;
}): Promise<TeamsTranscriptSubscription | undefined> => {
  try {
    const expirationDateTime = await renewTeamsTranscriptSubscription({
      accessToken,
      subscriptionId: subscription.subscriptionId,
    });
    const renewedSubscription = { ...subscription, expirationDateTime };

    await kv.set(subscriptionKvKey, renewedSubscription);

    return renewedSubscription;
  } catch (error) {
    if (error instanceof GraphRequestError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
};

const isTeamsConnectionListed = async (
  connectedAccountId: string,
): Promise<boolean> =>
  (await listConnections({ providerName: TEAMS_PROVIDER_NAME })).some(
    (connection) => connection.id === connectedAccountId,
  );

export const registerTeamsTranscriptSubscription = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ transcriptSubscriptionId: string | null }> => {
  const isTranscriptImportEnabled = isFeatureEnabled({
    isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
    settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
  });

  if (!isTranscriptImportEnabled) {
    await unregisterTeamsTranscriptSubscription({ connectedAccountId });

    return { transcriptSubscriptionId: null };
  }

  const apiUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiUrl)) {
    throw new Error(
      'TWENTY_API_URL is required to subscribe to Teams transcripts',
    );
  }

  const subscriptionKvKey =
    buildTeamsTranscriptSubscriptionKvKey(connectedAccountId);
  const connectionKvKey =
    buildTeamsTranscriptsConnectionKvKey(connectedAccountId);
  const storedSubscription =
    await kv.get<TeamsTranscriptSubscription>(subscriptionKvKey);
  const { accessToken } = await getConnection(connectedAccountId);

  const renewedSubscription = isDefined(storedSubscription)
    ? await renewStoredSubscriptionOrUndefined({
        accessToken,
        subscriptionKvKey,
        subscription: storedSubscription,
      })
    : undefined;

  if (isDefined(renewedSubscription)) {
    return { transcriptSubscriptionId: renewedSubscription.subscriptionId };
  }

  await kv.set(connectionKvKey, null, { scope: 'SERVER' });

  const subscription = await createTeamsTranscriptSubscription({
    accessToken,
    notificationUrl: buildTeamsTranscriptsWebhookUrl({
      apiUrl,
      connectedAccountId,
    }),
  });

  try {
    await kv.set(subscriptionKvKey, subscription);
  } catch (error) {
    await deleteTeamsTranscriptSubscription({
      accessToken,
      subscriptionId: subscription.subscriptionId,
    });

    throw error;
  }

  // A disconnect during the Graph call found nothing to delete, so the new subscription is dropped here.
  if (!(await isTeamsConnectionListed(connectedAccountId))) {
    await deleteTeamsTranscriptSubscription({
      accessToken,
      subscriptionId: subscription.subscriptionId,
    });
    await kv.delete(subscriptionKvKey);
    await kv.delete(connectionKvKey, { scope: 'SERVER' });

    return { transcriptSubscriptionId: null };
  }

  return { transcriptSubscriptionId: subscription.subscriptionId };
};
