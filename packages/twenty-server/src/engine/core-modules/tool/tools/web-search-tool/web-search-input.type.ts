import { type z } from 'zod';

import { type WebSearchInputZodSchema } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search-tool.schema';

export type WebSearchInput = z.infer<typeof WebSearchInputZodSchema>;
