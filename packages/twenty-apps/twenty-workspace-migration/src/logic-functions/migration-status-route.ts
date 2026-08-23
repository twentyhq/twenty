import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { readMigrationStatusSnapshot } from 'src/logic-functions/utils/migration-state.util';
import { MIGRATION_STATUS_ROUTE_PATH } from 'src/constants/migration-status-route-path';
import { MIGRATION_STATUS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

// Read-only endpoint backing the "Migration status" front component. A front component runs in
// the browser and can't read this app's own kv store directly, so it polls this route instead.
const handler = async (_event: RoutePayload): Promise<Response> =>
  jsonResponse(await readMigrationStatusSnapshot());

export default defineLogicFunction({
  universalIdentifier: MIGRATION_STATUS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'migration-status-route',
  description: 'Returns the current migration stage, time estimate, and recent log lines.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: MIGRATION_STATUS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
