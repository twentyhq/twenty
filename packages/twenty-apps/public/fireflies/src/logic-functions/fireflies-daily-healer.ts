import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { FIREFLIES_DAILY_HEALER_CRON_PATTERN } from 'src/logic-functions/constants/fireflies-daily-healer-cron-pattern.constant';
import { FIREFLIES_HEALING_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-healing-window-days.constant';
import { startFirefliesBackfillWorkers } from 'src/logic-functions/utils/start-fireflies-backfill-workers.util';

const firefliesDailyHealerCronHandler = async () => {
  const result = await startFirefliesBackfillWorkers({
    days: FIREFLIES_HEALING_WINDOW_DAYS,
  });

  console.log(
    result.outcome === FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED
      ? '[fireflies] Daily healing discovery skipped'
      : '[fireflies] Daily healing discovery started',
    result,
  );

  return result;
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
