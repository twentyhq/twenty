import { type z } from 'zod';

import { type SendEmailInputZodSchema } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool.schema';

export type SendEmailInput = z.infer<typeof SendEmailInputZodSchema>;
