import { defineLogicFunction } from 'twenty-sdk/define';

import { FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-daily-healer-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_TIMEOUT_SECONDS } from 'src/logic-functions/constants/fireflies-backfill-timeout-seconds.constant';
import { FIREFLIES_DAILY_HEALER_CRON_PATTERN } from 'src/logic-functions/constants/fireflies-daily-healer-cron-pattern.constant';
import { FIREFLIES_HEALING_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-healing-window-days.constant';
import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';
import { buildFirefliesBackfillCursor } from 'src/logic-functions/utils/build-fireflies-backfill-cursor.util';

const firefliesDailyHealerCronHandler =
  async (): Promise<FirefliesBackfillResult> =>
    firefliesBackfillHandler({
      cursor: buildFirefliesBackfillCursor({
        windowDays: FIREFLIES_HEALING_WINDOW_DAYS,
        nowMilliseconds: Date.now(),
      }),
    });

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_DAILY_HEALER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-daily-healer',
  description:
    'Daily sweep that imports Fireflies calls missed by webhooks over the last seven days.',
  timeoutSeconds: FIREFLIES_BACKFILL_TIMEOUT_SECONDS,
  handler: firefliesDailyHealerCronHandler,
  cronTriggerSettings: {
    pattern: FIREFLIES_DAILY_HEALER_CRON_PATTERN,
  },
});
