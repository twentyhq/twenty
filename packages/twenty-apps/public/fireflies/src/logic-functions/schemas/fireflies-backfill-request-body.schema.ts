import { z } from 'zod';

import { firefliesBackfillCursorSchema } from 'src/logic-functions/schemas/fireflies-backfill-cursor.schema';

export const firefliesBackfillRequestBodySchema = z.union([
  z.object({ cursor: firefliesBackfillCursorSchema }),
  z.object({ days: z.number().int().positive() }),
]);
