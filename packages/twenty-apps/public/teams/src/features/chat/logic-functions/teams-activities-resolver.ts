import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import {
  TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER,
  TEAMS_ACTIVITIES_ROUTE_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_NOT_CONNECTED_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-not-connected-text';
import { TEAMS_ASSISTANT_NOTICE_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-notice-ttl-ms';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { TeamsActivityTokenInvalidError } from 'src/features/chat/logic-functions/types/teams-activity-token-invalid-error';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { getTeamsBotCredentials } from 'src/features/chat/logic-functions/utils/get-teams-bot-credentials';
import { isTeamsInstallActivity } from 'src/features/chat/logic-functions/utils/is-teams-install-activity';
import { sendTeamsAssistantNotice } from 'src/features/chat/logic-functions/utils/send-teams-assistant-notice';
import { verifyTeamsActivityTokenOrThrow } from 'src/features/chat/logic-functions/utils/verify-teams-activity-token';

export const teamsActivitiesResolverHandler = async (
  routePayload: Pick<RoutePayload<TeamsInboundActivity>, 'headers' | 'body'>,
): Promise<ServerRouteResolverResult> => {
  const activity = routePayload.body;

  if (!isNonEmptyString(activity?.serviceUrl)) {
    return new Response({ error: 'Missing Teams activity' }, { status: 400 });
  }

  const botCredentials = getTeamsBotCredentials();

  if (!botCredentials.success) {
    return new Response({ error: botCredentials.error }, { status: 503 });
  }

  const serviceUrl = await verifyTeamsActivityTokenOrThrow({
    authorizationHeader: routePayload.headers.authorization,
    activityServiceUrl: activity.serviceUrl,
    botAppId: botCredentials.credentials.appId,
  }).catch((error: unknown) => {
    if (error instanceof TeamsActivityTokenInvalidError) {
      return null;
    }

    throw error;
  });

  if (!isNonEmptyString(serviceUrl)) {
    return new Response({ error: 'Unauthorized' }, { status: 401 });
  }

  if (activity.type !== 'message' && !isTeamsInstallActivity(activity)) {
    return new Response({ ok: true, skipped: 'Not a message' });
  }

  const tenantId =
    activity.channelData?.tenant?.id ?? activity.conversation?.tenantId;

  if (!isNonEmptyString(tenantId)) {
    return new Response({ ok: true, skipped: 'No tenant on the activity' });
  }

  const workspaceId = await kv.get<string>(buildTeamsTenantKvKey(tenantId), {
    scope: 'SERVER',
  });

  if (!isNonEmptyString(workspaceId)) {
    await sendTeamsAssistantNotice({
      payload: { activity, serviceUrl, tenantId },
      kind: 'not-connected',
      text: TEAMS_ASSISTANT_NOT_CONNECTED_TEXT,
      ttlMs: TEAMS_ASSISTANT_NOTICE_TTL_MS,
    });

    return new Response({
      ok: true,
      skipped: 'No workspace claims this Teams tenant',
    });
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER,
    payload: {
      activity,
      serviceUrl,
      tenantId,
    } satisfies TeamsActivitiesDispatchPayload,
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_ACTIVITIES_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'teams-activities-resolver',
  description:
    'Receives Microsoft Teams bot activities, verifies the Bot Framework token, and routes message and install activities to the workspace that claimed their tenant. When no workspace claims the tenant, tells the conversation once an hour that Twenty is not connected.',
  timeoutSeconds: 15,
  handler: teamsActivitiesResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: ['authorization'],
  },
});
