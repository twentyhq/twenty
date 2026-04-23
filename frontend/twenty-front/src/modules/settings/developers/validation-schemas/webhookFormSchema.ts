import { isValidUrl } from 'twenty-shared/utils';
import { z } from 'zod';

export const webhookFormSchema = z.object({
  targetUrl: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .refine((url) => isValidUrl(url), {
      error: 'Please enter a valid URL',
    }),
  description: z.string().optional(),
  operations: z
    .array(
      z.object({
        object: z.string().nullable(),
        action: z.string(),
      }),
    )
    .min(1, 'At least one operation is required')
    .refine(
      (operations) =>
        operations.some((op) => op.object !== null && op.action !== null),
      {
        error: 'At least one complete operation is required',
      },
    ),
  secret: z.string().optional(),
});

export type WebhookFormValues = z.infer<typeof webhookFormSchema>;
