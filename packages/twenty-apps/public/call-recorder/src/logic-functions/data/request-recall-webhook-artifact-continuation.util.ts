import { PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH } from 'src/constants/process-recall-webhook-artifacts-route-path';
import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';
import { type RecallWebhookArtifactContinuationRequest } from 'src/logic-functions/types/recall-webhook-artifact-continuation-request.type';

export const requestRecallWebhookArtifactContinuation = async (
  request: RecallWebhookArtifactContinuationRequest,
): Promise<boolean> =>
  postToOwnRoute({
    path: PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH,
    body: request,
  });
