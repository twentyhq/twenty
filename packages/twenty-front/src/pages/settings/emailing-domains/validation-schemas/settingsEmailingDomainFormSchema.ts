import { z } from 'zod';

export const settingsEmailingDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(
      /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])\.[a-zA-Z]{2,}$/,
      'Invalid domain format. Please enter a valid domain name.',
    )
    .max(256, 'Domain must be less than 256 characters.'),
});

export type SettingsEmailingDomainFormValues = z.infer<
  typeof settingsEmailingDomainFormSchema
>;
