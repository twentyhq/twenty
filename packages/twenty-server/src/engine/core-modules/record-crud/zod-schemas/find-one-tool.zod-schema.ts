import { z } from 'zod';

export const FindOneToolInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe(
      'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
    ),
  input: z.object({
    id: z.string().uuid().describe('The unique UUID of the record to retrieve'),
  }),
});

export type FindOneToolInput = z.infer<typeof FindOneToolInputSchema>;
