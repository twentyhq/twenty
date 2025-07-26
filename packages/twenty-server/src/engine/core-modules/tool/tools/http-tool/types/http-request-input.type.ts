import { z } from 'zod';

import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';

export type HttpRequestInput = z.infer<typeof HttpRequestInputZodSchema>;
