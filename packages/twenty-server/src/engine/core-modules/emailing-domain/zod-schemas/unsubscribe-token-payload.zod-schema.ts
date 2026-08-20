import { z } from 'zod';

export const unsubscribeTokenPayloadSchema = z.object({
  workspaceId: z.string().min(1),
  emailAddress: z.string().min(1),
  unsubscribeTopicId: z.string().min(1).optional(),
  preview: z.literal(true).optional(),
  issuedAt: z.number(),
});
