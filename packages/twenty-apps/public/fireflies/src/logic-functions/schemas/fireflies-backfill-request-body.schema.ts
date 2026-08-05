import { z } from 'zod';

import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-backfill-max-window-days.constant';

export const firefliesBackfillRequestBodySchema = z.object({
  days: z.number().int().positive().max(FIREFLIES_BACKFILL_MAX_WINDOW_DAYS),
});
