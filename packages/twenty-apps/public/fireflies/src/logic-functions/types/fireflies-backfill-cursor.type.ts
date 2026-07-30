import { type z } from 'zod';

import type { firefliesBackfillCursorSchema } from 'src/logic-functions/schemas/fireflies-backfill-cursor.schema';

export type FirefliesBackfillCursor = z.infer<
  typeof firefliesBackfillCursorSchema
>;
