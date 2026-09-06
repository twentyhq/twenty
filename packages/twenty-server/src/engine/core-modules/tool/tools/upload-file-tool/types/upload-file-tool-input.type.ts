import { type z } from 'zod';

import { type UploadFileToolInputZodSchema } from 'src/engine/core-modules/tool/tools/upload-file-tool/upload-file-tool.schema';

export type UploadFileToolInput = z.infer<typeof UploadFileToolInputZodSchema>;
