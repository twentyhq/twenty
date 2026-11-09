import { type z } from 'zod';

import { type ReadFileInputZodSchema } from 'src/engine/core-modules/tool/tools/read-file-tool/read-file-tool.schema';

export type ReadFileInput = z.infer<typeof ReadFileInputZodSchema>;
