import { type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackInteractivityRequestBody } from 'src/logic-functions/types/slack-interactivity-request-body.type';
import { getSlackWebhookSecret } from 'src/logic-functions/utils/get-slack-webhook-secret';
import { parseSlackInteractivityPayload } from 'src/logic-functions/utils/parse-slack-interactivity-payload';
import { resolveTargetWorkspaceId } from 'src/logic-functions/utils/resolve-target-workspace-id';
import { verifySlackRequestSignature } from 'src/logic-functions/utils/verify-slack-request-signature';

type SlackInteractivityResolverResult =
  | Response
  | {
      workspaceId: string;
      targetLogicFunctionUniversalIdentifier: string;
      payload: SlackInteractivityPayload;
    };

export const slackInteractivityResolverHandler = async (
  routePayload: RoutePayload<SlackInteractivityRequestBody>,
): Promise<SlackInteractivityResolverResult> => {
  const secretResult = getSlackWebhookSecret();

  if (!secretResult.success) {
    throw new Error(secretResult.error);
  }

  if (routePayload.rawBody === undefined) {
    throw new Error(
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  if (
    !verifySlackRequestSignature({
      rawBody: routePayload.rawBody,
      signatureHeader: routePayload.headers['x-slack-signature'],
      timestampHeader: routePayload.headers['x-slack-request-timestamp'],
      secret: secretResult.secret,
    })
  ) {
    throw new Error('Invalid Slack signature');
  }

  const payload = parseSlackInteractivityPayload(routePayload.body);

  const hasAssistantFeedbackAction =
    payload.type === 'block_actions' &&
    (payload.actions ?? []).some(
      (action) => action.action_id === SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
    );

  if (!hasAssistantFeedbackAction) {
    return new Response({ ok: true });
  }

  return {
    workspaceId: await resolveTargetWorkspaceId(payload.team?.id),
    targetLogicFunctionUniversalIdentifier:
      SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
    payload,
  };
};
