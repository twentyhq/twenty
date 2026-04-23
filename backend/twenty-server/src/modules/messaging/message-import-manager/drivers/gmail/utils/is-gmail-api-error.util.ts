import { type GaxiosError } from 'gaxios';
import { z } from 'zod';

const gmailApiErrorSchema = z.object({
  response: z.object({
    status: z.number().optional(),
    data: z
      .object({
        error: z
          .union([
            z.object({
              errors: z
                .array(
                  z.object({
                    reason: z.string().optional(),
                    message: z.string().optional(),
                  }),
                )
                .optional(),
            }),
            z.string(),
          ])
          .optional(),
        error_description: z.string().optional(),
      })
      .optional(),
  }),
});

export const isGmailApiError = (error: unknown): error is GaxiosError => {
  return gmailApiErrorSchema.safeParse(error).success;
};
