import { type z } from 'zod';

import { type CompleteFileUploadToolInputZodSchema } from 'src/engine/core-modules/tool/tools/file-upload-tool/file-upload-tool.schema';

export type CompleteFileUploadToolInput = z.infer<
  typeof CompleteFileUploadToolInputZodSchema
>;
