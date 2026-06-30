import { type z } from 'zod';

import { type CreateCalendarEventToolInputZodSchema } from 'src/engine/core-modules/tool/tools/calendar-tool/calendar-tool.schema';

export type CreateCalendarEventToolInput = z.infer<
  typeof CreateCalendarEventToolInputZodSchema
>;
