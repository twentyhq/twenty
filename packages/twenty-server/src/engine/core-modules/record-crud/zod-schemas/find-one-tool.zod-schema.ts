import { z } from 'zod';

export const FindOneToolInputSchema = z.object({
  id: z.string().uuid().describe('The unique UUID of the record to retrieve'),
});

export type FindOneToolInput = z.infer<typeof FindOneToolInputSchema>;
