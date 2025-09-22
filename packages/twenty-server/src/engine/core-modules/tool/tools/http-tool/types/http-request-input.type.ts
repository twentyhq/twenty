import { type z } from 'zod/v4';

import { type HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';

export type HttpRequestInput = z.infer<typeof HttpRequestInputZodSchema>;
