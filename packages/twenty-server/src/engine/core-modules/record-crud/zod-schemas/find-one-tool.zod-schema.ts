import { z } from 'zod';

export const FindOneToolInputSchema = z.object({
  id: z.string().uuid().describe('The unique UUID of the record to retrieve'),
  select: z
    .array(z.string())
    .nonempty()
    .describe(
      'Fields to include in the response. Required. ' +
        "Use '*' to return all fields. " +
        'Relation fields resolve to related records as {id, label} summaries: ' +
        'MANY_TO_ONE returns a single object (or select the <name>Id FK column for just the id), ' +
        'ONE_TO_MANY returns up to 60 related records.',
    ),
});

export type FindOneToolInput = z.infer<typeof FindOneToolInputSchema>;
