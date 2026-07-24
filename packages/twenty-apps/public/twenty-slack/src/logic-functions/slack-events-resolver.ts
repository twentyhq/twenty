import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import {
  SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';
import { getSlackSigningSecret } from 'src/logic-functions/utils/get-slack-signing-secret';
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
  const secretResult = getSlackSigningSecret();

  if (!secretResult.success) {
    throw new Error(secretResult.error);
  }

  if (routePayload.rawBody === undefined) {
    throw new Error(
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  const signatureCheck = verifySlackRequestSignature({
    rawBody: routePayload.rawBody,
    signatureHeader: routePayload.headers['x-slack-signature'],
    timestampHeader: routePayload.headers['x-slack-request-timestamp'],
    secret: secretResult.secret,
  });

  if (!signatureCheck.valid) {
    throw new Error(`Invalid Slack signature: ${signatureCheck.error}`);
  }

  const body = routePayload.body;

  if (!body) {
    throw new Error('Empty request body');
  }

  // Slack accepts the Request URL only when this handshake is echoed on the same
  // response, so it cannot be answered by the queued target function.
  if (body.type === 'url_verification' && isNonEmptyString(body.challenge)) {
    return new Response({ challenge: body.challenge });
  }

  return {
    workspaceId: await resolveTargetWorkspaceId(body),
    targetLogicFunctionUniversalIdentifier:
      SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
    payload: body,
  };
};

export default defineLogicFunction({
  universalIdentifier: SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-events-resolver',
  description:
    'Receives Slack Events API callbacks, verifies the request signature in the owner workspace, answers the url_verification handshake, and resolves the target workspace + enqueue function for the assistant.',
  timeoutSeconds: 15,
  handler: slackEventsResolverHandler,
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: ['x-slack-signature', 'x-slack-request-timestamp'],
  },
});
