import { type z } from 'zod';

import { type CreateInboxItemToolInputZodSchema } from 'src/engine/core-modules/tool/tools/inbox-tool/inbox-tool.schema';

export type CreateInboxItemToolInput = z.infer<
  typeof CreateInboxItemToolInputZodSchema
>;
