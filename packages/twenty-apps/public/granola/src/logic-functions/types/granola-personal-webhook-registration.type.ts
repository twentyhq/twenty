import { z } from 'zod';

export const GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA = z.object({
  userWorkspaceId: z.uuid(),
  webhookEndpointId: z.string().min(1),
  signingSecret: z.string().startsWith('whsec_'),
  apiKeyFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});

export type GranolaPersonalWebhookRegistration = z.infer<
  typeof GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA
>;
