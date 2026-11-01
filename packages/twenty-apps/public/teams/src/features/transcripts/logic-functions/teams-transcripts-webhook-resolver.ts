import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import {
  TEAMS_TRANSCRIPTS_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/features/transcripts/logic-functions/constants/teams-transcripts-webhook-connection-query-parameter';
import { buildTeamsTranscriptsConnectionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcripts-connection-kv-key';

export const teamsTranscriptsWebhookResolverHandler = async (
  routePayload: RoutePayload<unknown>,
): Promise<ServerRouteResolverResult> => {
  const validationToken = routePayload.queryStringParameters?.validationToken;

  // Graph validates the URL before the subscription exists and expects the token back as plain text.
  if (isNonEmptyString(validationToken)) {
    return new Response(validationToken, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const connectedAccountId =
    routePayload.queryStringParameters?.[
      TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER
    ];

  if (!isNonEmptyString(connectedAccountId)) {
    return new Response(
      { error: 'Missing Teams connection identifier' },
      { status: 400 },
    );
  }

  const workspaceId = await kv.get<string>(
    buildTeamsTranscriptsConnectionKvKey(connectedAccountId),
    { scope: 'SERVER' },
  );

  if (!isNonEmptyString(workspaceId)) {
    return new Response({ error: 'Unknown Teams connection' }, { status: 404 });
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      TEAMS_TRANSCRIPTS_WEBHOOK_UNIVERSAL_IDENTIFIER,
    payload: routePayload,
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPTS_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcripts-webhook-resolver',
  description:
    'Answers Microsoft Graph endpoint validation and routes transcript subscription notifications to the workspace that claimed the connection named in the query string.',
  timeoutSeconds: 15,
  handler: teamsTranscriptsWebhookResolverHandler,
  serverRouteTriggerSettings: { httpMethods: ['POST'] },
});
