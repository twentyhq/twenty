import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import {
  SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
  SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { getSlackWebhookSecret } from 'src/logic-functions/utils/get-slack-webhook-secret';
import { resolveTargetWorkspaceId } from 'src/logic-functions/utils/resolve-target-workspace-id';
import { verifySlackRequestSignature } from 'src/logic-functions/utils/verify-slack-request-signature';

type SlackEventsResolverResult =
  | Response
  | {
      workspaceId: string;
      targetLogicFunctionUniversalIdentifier: string;
      payload: SlackEventsRequestBody;
    };

export const slackEventsResolverHandler = async (
  routePayload: RoutePayload<SlackEventsRequestBody>,
): Promise<SlackEventsResolverResult> => {
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

  const body = routePayload.body;

  if (!body) {
    throw new Error('Empty request body');
  }

  if (body.type === 'url_verification' && isNonEmptyString(body.challenge)) {
    return new Response({ challenge: body.challenge });
  }

  const targetLogicFunctionUniversalIdentifier =
    resolveTargetLogicFunctionUniversalIdentifier(body);

  if (
    targetLogicFunctionUniversalIdentifier ===
    SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
  ) {
    if (!isNonEmptyString(body.team_id)) {
      throw new Error(
        'Slack event has no team_id; cannot resolve the target workspace',
      );
    }

    const claimedWorkspaceId = await findClaimedWorkspaceId(body.team_id);

    if (claimedWorkspaceId === null) {
      return new Response({
        ok: true,
        skipped: 'No workspace claims this Slack team',
      });
    }

    return {
      workspaceId: claimedWorkspaceId,
      targetLogicFunctionUniversalIdentifier,
      payload: body,
    };
  }

  return {
    workspaceId: await resolveTargetWorkspaceId(body),
    targetLogicFunctionUniversalIdentifier,
    payload: body,
  };
};

const resolveTargetLogicFunctionUniversalIdentifier = (
  body: SlackEventsRequestBody,
): string => {
  switch (body.event?.type) {
    case 'member_joined_channel':
      return SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER;
    case 'app_home_opened':
      return SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER;
    case 'app_uninstalled':
    case 'tokens_revoked':
      return SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER;
    default:
      return SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER;
  }
};

export default defineLogicFunction({
  universalIdentifier: SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-events-resolver',
  description:
    'Receives Slack Events API callbacks, verifies the request signature in the owner workspace, answers the url_verification handshake, and resolves the target workspace plus the function that handles the event (assistant enqueue, the channel welcome on member_joined_channel, the suggested prompts on app_home_opened, or the team release on app_uninstalled and tokens_revoked).',
  timeoutSeconds: 15,
  handler: slackEventsResolverHandler,
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: ['x-slack-signature', 'x-slack-request-timestamp'],
  },
});
