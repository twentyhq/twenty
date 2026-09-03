import { z } from 'zod';

export const FindConnectedAccountsToolInputZodSchema = z.object({
  handle: z
    .string()
    .describe(
      'Optional email handle to match against the connected account handle or aliases. Case-insensitive.',
    )
    .optional(),
});

export type FindConnectedAccountsToolInput = z.infer<
  typeof FindConnectedAccountsToolInputZodSchema
>;
