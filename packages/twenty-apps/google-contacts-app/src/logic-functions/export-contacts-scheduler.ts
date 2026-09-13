import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  findConnectionForRequest,
  listConnections,
  Response,
  RoutePayload
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { EXPORT_CONTACTS_ROUTE_PATH } from 'src/constants/route-paths';
import {
  EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  EXPORT_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const handler = async (payload: RoutePayload<{ recordIds?: string[] }>) => {
  const connection = findConnectionForRequest(
    await listConnections({ providerName: 'google-contacts' }),
    payload,
  );

  if (isDefined(connection) === false) {
    return jsonResponse({ status: 'no-connection' }, 200);
  }

  if (isDefined(connection.authFailedAt)) {
    return jsonResponse({ status: 'auth-failed' }, 200);
  }

  if (isDefined(payload.body?.recordIds) === false || payload.body?.recordIds.length === 0) {
    return jsonResponse({ status: 'no-contacts-found' }, 200);
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier: EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobs: [{payload: {connection: connection, recordIds: payload.body?.recordIds }}]
  })
  return jsonResponse({ status: 'exported' }, 200);
};

export default defineLogicFunction({
  universalIdentifier: EXPORT_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'export-contacts-scheduler',
  description:
    'Creates or updates the Google contacts matching the Twenty people the user selected.',
  timeoutSeconds: 900,
  handler,
  httpRouteTriggerSettings: {
    path: EXPORT_CONTACTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
