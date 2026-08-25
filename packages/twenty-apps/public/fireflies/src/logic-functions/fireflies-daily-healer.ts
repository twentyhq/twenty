import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';

import {
  FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { FIREFLIES_DAILY_HEALER_CRON_PATTERN } from 'src/logic-functions/constants/fireflies-daily-healer-cron-pattern.constant';
import { FIREFLIES_HEALING_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-healing-window-days.constant';

const firefliesDailyHealerCronHandler = async () => {
  const connections = await listConnections({
    providerName: 'fireflies',
    visibility: 'workspace',
  });

  if (connections.length === 0) {
    const notConfiguredResult = {
      outcome: FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED,
      error:
        'Fireflies is not configured. Add at least one workspace-shared Fireflies connection.',
    };

    console.log(
      '[fireflies] Daily healing discovery skipped',
      notConfiguredResult,
    );

    return notConfiguredResult;
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: connections.map((connection) => ({
      connectionId: connection.id,
      days: FIREFLIES_HEALING_WINDOW_DAYS,
    })),
  });

  const startedResult = {
    outcome: FIREFLIES_BACKFILL_OUTCOME.STARTED,
    connectionCount: connections.length,
  };

  console.log('[fireflies] Daily healing discovery started', startedResult);

  return startedResult;
};

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-daily-healer',
  description:
    'Daily sweep that starts one seven-day healing job for each connected Fireflies account.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesDailyHealerCronHandler,
  cronTriggerSettings: {
    pattern: FIREFLIES_DAILY_HEALER_CRON_PATTERN,
  },
});
