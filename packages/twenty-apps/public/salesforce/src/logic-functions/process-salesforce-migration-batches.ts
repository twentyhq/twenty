import { defineLogicFunction } from 'twenty-sdk/define';

import { PROCESS_MIGRATION_BATCHES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  type MigrationTickSummary,
  runMigrationTick,
} from 'src/logic-functions/migration/run-migration-tick';

// Stays under the one-minute cron interval so ticks do not pile up; the
// heartbeat guard covers the rare overlap, and batches are idempotent anyway.
const CRON_TICK_BUDGET_MS = 45_000;

const handler = async (): Promise<MigrationTickSummary> =>
  await runMigrationTick({ timeBudgetMs: CRON_TICK_BUDGET_MS });

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_MIGRATION_BATCHES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-salesforce-migration-batches',
  description:
    'Background worker: advances the running Salesforce migration batch by batch, updating live progress counters and recording per-record failures.',
  timeoutSeconds: 90,
  handler,
  cronTriggerSettings: {
    pattern: '* * * * *',
  },
});
