import { z } from 'zod';

import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const pipelineStepValueSchema = z.object({
  color: themeColorSchema,
  label: z.string(),
});

export const isFieldPipelineStepValue = (
  fieldValue: unknown,
): fieldValue is z.infer<typeof pipelineStepValueSchema> =>
  pipelineStepValueSchema.safeParse(fieldValue).success;
