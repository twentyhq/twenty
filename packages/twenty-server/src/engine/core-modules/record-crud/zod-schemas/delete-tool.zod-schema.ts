import { z } from 'zod';

export const DeleteToolInputSchema = z.object({
  id: z.string().uuid().describe('The unique UUID of the record to delete'),
});

export type DeleteToolInput = z.infer<typeof DeleteToolInputSchema>;
