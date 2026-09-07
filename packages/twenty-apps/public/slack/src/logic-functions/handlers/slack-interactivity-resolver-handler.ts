import { type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { SLACK_USER_LINK_CONSENT_ACTION_ID } from 'src/logic-functions/constants/slack-user-link-consent-action-id';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackInteractivityRequestBody } from 'src/logic-functions/types/slack-interactivity-request-body.type';
import { parseSlackInteractivityPayloadOrThrow } from 'src/logic-functions/utils/parse-slack-interactivity-payload-or-throw';
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

  const payload = parseSlackInteractivityPayloadOrThrow(routePayload.body);

  if (payload.type !== 'block_actions') {
    return new Response({ ok: true });
  }

  const actions = payload.actions ?? [];

  const hasAssistantFeedbackAction = actions.some(
    (action) => action.action_id === SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
  );

  const hasUserLinkConsentAction = actions.some((action) =>
    action.action_id?.startsWith(SLACK_USER_LINK_CONSENT_ACTION_ID),
  );

  const targetLogicFunctionUniversalIdentifier = [
    {
      isMatched: hasAssistantFeedbackAction,
      identifier: SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
    },
    {
      isMatched: hasUserLinkConsentAction,
      identifier: SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
    },
  ].find(({ isMatched }) => isMatched)?.identifier;

  if (!isDefined(targetLogicFunctionUniversalIdentifier)) {
    return new Response({ ok: true });
  }

  return {
    workspaceId: await resolveTargetWorkspaceId(payload.team?.id),
    targetLogicFunctionUniversalIdentifier,
    payload,
  };
};
