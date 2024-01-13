import { z } from 'zod';

import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const pipelineStepsValueSchema = z.object({
  color: themeColorSchema,
  label: z.string(),
});

export const isFieldPipelineStepsValue = (
  fieldValue: unknown,
): fieldValue is z.infer<typeof pipelineStepsValueSchema> =>
  pipelineStepsValueSchema.safeParse(fieldValue).success;
