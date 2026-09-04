import { isNonEmptyString } from '@sniptt/guards';
import { Fathom } from 'fathom-typescript';
import { meetingFromJSON } from 'fathom-typescript/sdk/models/shared';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import { FATHOM_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';
import { listFathomConnections } from 'src/logic-functions/utils/list-fathom-connections.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';

type FathomWebhookResult =
  | {
      success: true;
      callRecordingId: string;
      calendarEventId?: string;
      created: boolean;
    }
  | { success: true; skipped: true; reason: string }
  | { success: false; error: string };

export const fathomWebhookHandler = async (
  routePayload: RoutePayload<unknown>,
): Promise<FathomWebhookResult> => {
  const connectedAccountId =
    routePayload.queryStringParameters?.[
      FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER
    ];

  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Missing Fathom connection identifier' };
  }

  const registration = await kv.get<FathomWebhookRegistration>(
    getFathomWebhookRegistrationKey(connectedAccountId),
  );

  if (!isDefined(registration)) {
    return { success: false, error: 'Unknown Fathom webhook registration' };
  }

  if (!isNonEmptyString(routePayload.rawBody)) {
    return { success: false, error: 'Missing raw Fathom webhook body' };
  }

  const webhookId = routePayload.headers['webhook-id'];
  const webhookTimestamp = routePayload.headers['webhook-timestamp'];
  const webhookSignature = routePayload.headers['webhook-signature'];

  if (
    !isNonEmptyString(webhookId) ||
    !isNonEmptyString(webhookTimestamp) ||
    !isNonEmptyString(webhookSignature)
  ) {
    return { success: false, error: 'Missing Fathom webhook signature' };
  }

  try {
    Fathom.verifyWebhook(
      registration.secret,
      {
        'webhook-id': webhookId,
        'webhook-timestamp': webhookTimestamp,
        'webhook-signature': webhookSignature,
      },
      routePayload.rawBody,
    );
  } catch {
    return { success: false, error: 'Invalid Fathom webhook signature' };
  }

  if (!registration.isActive) {
    return {
      success: true,
      skipped: true,
      reason: 'The Fathom connection has been removed',
    };
  }

  const meetingParseResult = meetingFromJSON(routePayload.rawBody);

  if (!meetingParseResult.ok) {
    return { success: false, error: 'Invalid Fathom meeting payload' };
  }

  const connection = (await listFathomConnections()).find(
    (candidate) => candidate.id === connectedAccountId,
  );

  if (!isDefined(connection)) {
    return { success: false, error: 'Fathom connection must be reconnected' };
  }

  const syncResult = await syncFathomMeetingToCallRecording({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    meeting: meetingParseResult.value,
    connection,
  });

  return { success: true, ...syncResult };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'fathom-webhook',
  description:
    'Verifies Fathom meeting webhooks and upserts accessible recordings into CallRecording records.',
  timeoutSeconds: 60,
  handler: fathomWebhookHandler,
});
