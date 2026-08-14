import { type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackInteractivityRequestBody } from 'src/logic-functions/types/slack-interactivity-request-body.type';
import { parseSlackInteractivityPayload } from 'src/logic-functions/utils/parse-slack-interactivity-payload';
import { resolveTargetWorkspaceId } from 'src/logic-functions/utils/resolve-target-workspace-id';
import { verifySlackWebhookRequestOrThrow } from 'src/logic-functions/utils/verify-slack-webhook-request-or-throw';

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
  verifySlackWebhookRequestOrThrow(routePayload);

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
