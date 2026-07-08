import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { PROCESS_RECALL_WEBHOOK_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-recall-webhook-artifacts-logic-function-universal-identifier';
import { PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH } from 'src/constants/process-recall-webhook-artifacts-route-path';
import {
  processRecallWebhookArtifacts,
  type ProcessRecallWebhookArtifactsResult,
} from 'src/logic-functions/flows/process-recall-webhook-artifacts.util';
import { type RecallWebhookArtifactContinuationRequest } from 'src/logic-functions/types/recall-webhook-artifact-continuation-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const processRecallWebhookArtifactsHandler = async (
  payload: RoutePayload<Partial<RecallWebhookArtifactContinuationRequest>>,
): Promise<ProcessRecallWebhookArtifactsResult> => {
  const request = parseRecallWebhookArtifactContinuationRequest(payload.body);

  if (isUndefined(request)) {
    return {
      status: 'skipped',
      event: getString(payload.body?.event) ?? 'unknown',
      callRecordingId: getString(payload.body?.callRecordingId) ?? 'unknown',
      reason: 'invalid artifact continuation request',
    };
  }

  return processRecallWebhookArtifacts({
    client: new CoreApiClient(),
    request,
  });
};

const parseRecallWebhookArtifactContinuationRequest = (
  body: Partial<RecallWebhookArtifactContinuationRequest> | null | undefined,
): RecallWebhookArtifactContinuationRequest | undefined => {
  if (isNull(body) || isUndefined(body)) {
    return undefined;
  }

  const event = getString(body.event);
  const callRecordingId = getString(body.callRecordingId);
  const requestedAt = getString(body.requestedAt);

  if (
    isUndefined(event) ||
    isUndefined(callRecordingId) ||
    isUndefined(requestedAt)
  ) {
    return undefined;
  }

  return {
    event,
    callRecordingId,
    requestedAt,
    externalBotId: getString(body.externalBotId),
    externalRecordingId: getString(body.externalRecordingId),
    transcriptId: getString(body.transcriptId),
    transcriptFailureSubCode: isNull(body.transcriptFailureSubCode)
      ? null
      : getString(body.transcriptFailureSubCode),
  };
};

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_RECALL_WEBHOOK_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-recall-webhook-artifacts',
  description:
    'Continues verified Recall webhook work asynchronously by reconciling recording media and transcript artifacts for the resolved workspace.',
  timeoutSeconds: 250,
  handler: processRecallWebhookArtifactsHandler,
  httpRouteTriggerSettings: {
    path: PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
