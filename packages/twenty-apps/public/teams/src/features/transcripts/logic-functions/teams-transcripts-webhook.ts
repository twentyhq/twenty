import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { GRAPH_CREATED_CHANGE_TYPE } from 'src/features/transcripts/logic-functions/constants/graph-created-change-type';
import { GRAPH_REAUTHORIZATION_REQUIRED_LIFECYCLE_EVENT } from 'src/features/transcripts/logic-functions/constants/graph-reauthorization-required-lifecycle-event';
import { TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/features/transcripts/logic-functions/constants/teams-transcripts-webhook-connection-query-parameter';
import { type TeamsTranscriptImportOutcome } from 'src/features/transcripts/logic-functions/types/teams-transcript-import-outcome.type';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { buildTeamsTranscriptSubscriptionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-subscription-kv-key';
import { importTeamsTranscriptOrScheduleRetry } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-or-schedule-retry';
import { parseTeamsTranscriptResource } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-resource';
import { parseTeamsTranscriptSubscriptionNotifications } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-subscription-notifications';
import { renewTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/renew-teams-transcript-subscription';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

type TeamsTranscriptsWebhookResult =
  | {
      success: true;
      expirationDateTime?: string;
      transcriptImportOutcomes: TeamsTranscriptImportOutcome[];
    }
  | { success: true; skipped: true; reason: string }
  | { success: false; error: string };

const renewStoredTeamsTranscriptSubscription = async ({
  connectedAccountId,
  subscriptionKvKey,
  subscription,
}: {
  connectedAccountId: string;
  subscriptionKvKey: string;
  subscription: TeamsTranscriptSubscription;
}): Promise<string> => {
  const { accessToken } = await getConnection(connectedAccountId);
  const expirationDateTime = await renewTeamsTranscriptSubscription({
    accessToken,
    subscriptionId: subscription.subscriptionId,
  });

  await kv.set(subscriptionKvKey, { ...subscription, expirationDateTime });

  return expirationDateTime;
};

const isRetryableRejection = (
  settledResult: PromiseSettledResult<unknown>,
): settledResult is PromiseRejectedResult =>
  settledResult.status === 'rejected' &&
  settledResult.reason instanceof RetryableLogicFunctionError;

const importTeamsTranscriptFromResourceOrThrow = async ({
  connectedAccountId,
  resource,
}: {
  connectedAccountId: string;
  resource: unknown;
}): Promise<TeamsTranscriptImportOutcome> => {
  const transcriptReference = parseTeamsTranscriptResource(resource);

  if (!isDefined(transcriptReference)) {
    throw new Error('Microsoft Graph sent an unrecognized transcript resource');
  }

  const { outcome } = await importTeamsTranscriptOrScheduleRetry({
    connectedAccountId,
    ...transcriptReference,
    attempt: 0,
  });

  return outcome;
};

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

  const isReauthorizationRequired = notifications.some(
    (notification) =>
      notification.lifecycleEvent ===
      GRAPH_REAUTHORIZATION_REQUIRED_LIFECYCLE_EVENT,
  );
  const transcriptResources = notifications
    .filter(
      (notification) => notification.changeType === GRAPH_CREATED_CHANGE_TYPE,
    )
    .map((notification) => notification.resource);
  const [subscriptionRenewal, ...transcriptImports] = await Promise.allSettled([
    isReauthorizationRequired
      ? renewStoredTeamsTranscriptSubscription({
          connectedAccountId,
          subscriptionKvKey,
          subscription,
        })
      : undefined,
    ...transcriptResources.map((resource) =>
      importTeamsTranscriptFromResourceOrThrow({
        connectedAccountId,
        resource,
      }),
    ),
  ]);
  const transcriptImportOutcomes = transcriptImports.map(
    (transcriptImport, index): TeamsTranscriptImportOutcome => {
      if (transcriptImport.status === 'fulfilled') {
        return transcriptImport.value;
      }

      console.error(
        `[teams] failed to import transcript ${String(transcriptResources[index])} for connected account ${connectedAccountId}: ${toErrorMessage(transcriptImport.reason)}`,
      );

      return 'failed';
    },
  );

  const retryableTranscriptImport =
    transcriptImports.find(isRetryableRejection);

  if (subscriptionRenewal.status === 'rejected') {
    console.error(
      `[teams] failed to renew transcript subscription ${subscription.subscriptionId} for connected account ${connectedAccountId}: ${toErrorMessage(subscriptionRenewal.reason)}`,
    );
  }

  if (isDefined(retryableTranscriptImport)) {
    throw retryableTranscriptImport.reason;
  }

  if (subscriptionRenewal.status === 'rejected') {
    throw subscriptionRenewal.reason;
  }

  return {
    success: true,
    expirationDateTime: subscriptionRenewal.value,
    transcriptImportOutcomes,
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcripts-webhook',
  description:
    'Checks Microsoft Graph transcript notifications against the subscription stored for the connection, imports new transcripts into Call Recordings, and renews the subscription when Graph asks for reauthorization.',
  timeoutSeconds: 300,
  handler: teamsTranscriptsWebhookHandler,
});
