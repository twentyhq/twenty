import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { FIREFLIES_DAILY_HEALER_CRON_PATTERN } from 'src/logic-functions/constants/fireflies-daily-healer-cron-pattern.constant';
import { FIREFLIES_HEALING_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-healing-window-days.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';

const firefliesDailyHealerCronHandler =
  async (): Promise<FirefliesBackfillResult> =>
    firefliesBackfillHandler({ windowDays: FIREFLIES_HEALING_WINDOW_DAYS });

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-daily-healer',
  description:
    'Daily sweep that enqueues import batches for Fireflies calls missed by webhooks over the last seven days.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesDailyHealerCronHandler,
  cronTriggerSettings: {
    pattern: FIREFLIES_DAILY_HEALER_CRON_PATTERN,
  },
});
