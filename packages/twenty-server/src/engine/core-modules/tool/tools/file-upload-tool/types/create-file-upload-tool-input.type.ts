import { type z } from 'zod';

import { type CreateFileUploadToolInputZodSchema } from 'src/engine/core-modules/tool/tools/file-upload-tool/file-upload-tool.schema';

export type CreateFileUploadToolInput = z.infer<
  typeof CreateFileUploadToolInputZodSchema
>;
