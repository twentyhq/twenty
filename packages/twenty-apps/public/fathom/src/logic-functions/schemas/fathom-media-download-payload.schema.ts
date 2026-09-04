import { z } from 'zod';

export const fathomRequestMediaDownloadPayloadSchema = z.object({
  callRecordingId: z.string().trim().min(1),
  rateLimitAttempt: z.number().int().nonnegative().optional(),
});

export const fathomImportMediaDownloadPayloadSchema =
  fathomRequestMediaDownloadPayloadSchema.extend({
    downloadId: z.string().trim().min(1),
    attempt: z.number().int().nonnegative(),
  });

export const fathomMediaImportPayloadSchema =
  fathomRequestMediaDownloadPayloadSchema.extend({
    downloadId: z.string().trim().min(1).optional(),
    attempt: z.number().int().nonnegative().default(0),
  });

export type FathomRequestMediaDownloadPayload = z.infer<
  typeof fathomRequestMediaDownloadPayloadSchema
>;

export type FathomImportMediaDownloadPayload = z.infer<
  typeof fathomImportMediaDownloadPayloadSchema
>;
