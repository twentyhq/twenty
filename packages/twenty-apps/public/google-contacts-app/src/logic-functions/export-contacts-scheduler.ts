import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  findConnectionForRequest,
  listConnections,
  Response,
  RoutePayload,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { EXPORT_CONTACTS_ROUTE_PATH } from 'src/constants/route-paths';
import { buildExportJobId } from 'src/logic-functions/data/build-export-job-id.util';
import { fetchReadablePeople } from 'src/logic-functions/data/fetch-readable-people.util';
import { readRecordIds } from 'src/logic-functions/data/read-record-ids.util';
import {
  EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  EXPORT_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const handler = async (payload: RoutePayload<{ recordIds?: unknown }>) => {
  const connection = findConnectionForRequest(
    await listConnections({ providerName: 'google-contacts' }),
    payload,
  );

  if (!isDefined(connection) || connection.visibility === 'workspace') {
    return jsonResponse({ status: 'no-connection' }, 200);
  }

  if (isDefined(connection.authFailedAt)) {
    return jsonResponse({ status: 'auth-failed' }, 200);
  }

  const recordIds = readRecordIds(payload.body?.recordIds);

  if (recordIds.length === 0) {
    return jsonResponse({ status: 'no-contacts-found' }, 200);
  }

  const readablePeople = await fetchReadablePeople({
    client: new CoreApiClient(),
    personIds: recordIds,
  });

  if (readablePeople.length === 0) {
    return jsonResponse({ status: 'no-contacts-found' }, 200);
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        payload: {
          connectionId: connection.id,
          recordIds: readablePeople.map(({ id }) => id),
        },
        jobId: buildExportJobId({
          connectionId: connection.id,
          people: readablePeople,
        }),
      },
    ],
  });

  return jsonResponse({ status: 'exported' }, 200);
};

export default defineLogicFunction({
  universalIdentifier:
    EXPORT_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
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
