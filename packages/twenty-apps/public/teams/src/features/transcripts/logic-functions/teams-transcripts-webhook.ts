import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getConnection, kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { GRAPH_REAUTHORIZATION_REQUIRED_LIFECYCLE_EVENT } from 'src/features/transcripts/logic-functions/constants/graph-reauthorization-required-lifecycle-event';
import { TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/features/transcripts/logic-functions/constants/teams-transcripts-webhook-connection-query-parameter';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { buildTeamsTranscriptSubscriptionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-subscription-kv-key';
import { parseTeamsTranscriptSubscriptionNotifications } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-subscription-notifications';
import { renewTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/renew-teams-transcript-subscription';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

type TeamsTranscriptsWebhookResult =
  | { success: true; expirationDateTime?: string }
  | { success: true; skipped: true; reason: string }
  | { success: false; error: string };

export const teamsTranscriptsWebhookHandler = async (
  routePayload: RoutePayload<unknown>,
): Promise<TeamsTranscriptsWebhookResult> => {
  const connectedAccountId =
    routePayload.queryStringParameters?.[
      TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER
    ];

  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Missing Teams connection identifier' };
  }

  const subscriptionKvKey =
    buildTeamsTranscriptSubscriptionKvKey(connectedAccountId);
  const subscription =
    await kv.get<TeamsTranscriptSubscription>(subscriptionKvKey);

  if (!isDefined(subscription)) {
    return { success: false, error: 'Unknown Teams transcript subscription' };
  }

  const notifications = parseTeamsTranscriptSubscriptionNotifications({
    body: routePayload.body,
    subscription,
  });

  if (!isDefined(notifications)) {
    return { success: false, error: 'Invalid Microsoft Graph notification' };
  }

  const isReauthorizationRequired = notifications.some(
    (notification) =>
      notification.lifecycleEvent ===
      GRAPH_REAUTHORIZATION_REQUIRED_LIFECYCLE_EVENT,
  );

  if (!isReauthorizationRequired) {
    return { success: true };
  }

  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcripts are not enabled',
    };
  }

  const { accessToken } = await getConnection(connectedAccountId);
  const expirationDateTime = await renewTeamsTranscriptSubscription({
    accessToken,
    subscriptionId: subscription.subscriptionId,
  });

  await kv.set(subscriptionKvKey, { ...subscription, expirationDateTime });

  return { success: true, expirationDateTime };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcripts-webhook',
  description:
    'Checks Microsoft Graph transcript notifications against the subscription stored for the connection, and renews the subscription when Graph asks for reauthorization.',
  timeoutSeconds: 60,
  handler: teamsTranscriptsWebhookHandler,
});
