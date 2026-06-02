import { z } from 'zod';

export const FindOneToolInputSchema = z.object({
  id: z.string().uuid().describe('The unique UUID of the record to retrieve'),
  select: z
    .array(z.string())
    .optional()
    .describe(
      'Fields to include in the response. ' +
        'Defaults to id + display name. ' +
        "Use '*' to return all fields. " +
        'id is always included. MANY_TO_ONE relations are referenced by their FK column (e.g. companyId).',
    ),
});

export type FindOneToolInput = z.infer<typeof FindOneToolInputSchema>;
