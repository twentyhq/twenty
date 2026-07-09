import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { MIGRATION_STATUS } from 'src/constants/migration-status';
import { RUN_MIGRATION_TICK_ROUTE_PATH } from 'src/constants/route-paths';
import { WATCH_MIGRATIONS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { postToOwnRoute } from 'src/logic-functions/utils/post-to-own-route';

// Above the worst-case gap between heartbeat writes of a live tick chain, so
// the watchdog never races a healthy chain.
const STALLED_THRESHOLD_MS = 2 * 60 * 1_000;

const isStalled = (heartbeatAt: string | null): boolean => {
  if (heartbeatAt === null) {
    return true;
  }

  const heartbeatTime = new Date(heartbeatAt).getTime();

  return (
    !Number.isFinite(heartbeatTime) ||
    Date.now() - heartbeatTime > STALLED_THRESHOLD_MS
  );
};

// Safety net for the self-chaining tick worker: if a running migration has
// not made progress recently (a slice crashed, the server restarted, or a
// transient Salesforce error interrupted the chain), restart the chain.
const handler = async (): Promise<{
  outcome: 'no-running-migration' | 'chain-alive' | 'chain-restarted';
}> => {
  const client = new CoreApiClient();
  const response = await client.query({
    salesforceMigrations: {
      __args: {
        filter: { status: { eq: MIGRATION_STATUS.RUNNING } },
        first: 1,
      },
      edges: { node: { id: true, heartbeatAt: true } },
    },
  });

  const migration = (response as Record<string, any>).salesforceMigrations
    ?.edges?.[0]?.node as { id: string; heartbeatAt: string | null } | undefined;

  if (migration === undefined) {
    return { outcome: 'no-running-migration' };
  }

  if (!isStalled(migration.heartbeatAt)) {
    return { outcome: 'chain-alive' };
  }

  await postToOwnRoute({ path: RUN_MIGRATION_TICK_ROUTE_PATH, body: {} });

  return { outcome: 'chain-restarted' };
};

export default defineLogicFunction({
  universalIdentifier: WATCH_MIGRATIONS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'watch-salesforce-migrations',
  description:
    'Watchdog: restarts the migration worker chain when a running Salesforce migration has stopped making progress.',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
