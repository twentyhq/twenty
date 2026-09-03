import { z } from 'zod';

const progressTokenParamsSchema = z.object({
  _meta: z.object({
    progressToken: z.union([z.string(), z.number().int()]),
  }),
});

export const getProgressToken = (params: Record<string, unknown>) => {
  const parsed = progressTokenParamsSchema.safeParse(params);

  return parsed.success ? parsed.data._meta.progressToken : undefined;
};
