import { defineLogicFunction } from 'twenty-sdk/define';

import { RUN_MIGRATION_TICK_ROUTE_PATH } from 'src/constants/route-paths';
import { RUN_MIGRATION_TICK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  type MigrationTickSummary,
  runMigrationTick,
} from 'src/logic-functions/migration/run-migration-tick';
import { postToOwnRoute } from 'src/logic-functions/utils/post-to-own-route';

const TICK_BUDGET_MS = 45_000;

// One worker slice. As long as work remains, each slice fires the next one,
// so a migration runs back to back without polling; the watchdog cron only
// revives the chain if a slice dies. Slices are idempotent (upsert by
// salesforceId with an Id watermark), so a duplicated slice is harmless.
const handler = async (): Promise<MigrationTickSummary> => {
  const summary = await runMigrationTick({
    timeBudgetMs: TICK_BUDGET_MS,
    ignoreFreshHeartbeat: true,
  });

  if (summary.outcome === 'progressed') {
    await postToOwnRoute({ path: RUN_MIGRATION_TICK_ROUTE_PATH, body: {} });
  }

  return summary;
};

export default defineLogicFunction({
  universalIdentifier: RUN_MIGRATION_TICK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'run-salesforce-migration-tick',
  description:
    'Processes one time-boxed slice of the running Salesforce migration and chains the next slice until the migration completes, pauses, or fails.',
  timeoutSeconds: 90,
  handler,
  httpRouteTriggerSettings: {
    path: RUN_MIGRATION_TICK_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
