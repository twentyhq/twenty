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
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { TeamsActivityTokenInvalidError } from 'src/features/chat/logic-functions/types/teams-activity-token-invalid-error';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { getTeamsBotCredentials } from 'src/features/chat/logic-functions/utils/get-teams-bot-credentials';
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

  if (activity.type !== 'message') {
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
    'Receives Microsoft Teams bot activities, verifies the Bot Framework token, and routes message activities to the workspace that claimed their tenant.',
  timeoutSeconds: 15,
  handler: teamsActivitiesResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: ['authorization'],
  },
});
