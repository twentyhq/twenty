import { z } from 'zod';

export const FindOneToolInputSchema = z.object({
  id: z.string().uuid().describe('The unique UUID of the record to retrieve'),
  select: z
    .array(z.string())
    .nonempty()
    .describe(
      'Fields to include in the response. Required. ' +
        "Use '*' to return all fields. " +
        ' MANY_TO_ONE relations are referenced by their FK column (e.g. companyId).',
    ),
});

export type FindOneToolInput = z.infer<typeof FindOneToolInputSchema>;
