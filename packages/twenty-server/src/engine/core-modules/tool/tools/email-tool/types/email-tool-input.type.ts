import { type z } from 'zod';

import { type EmailToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/email-tool.schema';

export type EmailToolInput = z.infer<typeof EmailToolInputZodSchema>;
