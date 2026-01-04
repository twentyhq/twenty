import { isValidUuid } from 'twenty-shared/utils';
import { workflowFileSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

export const SendEmailInputZodSchema = z.object({
  email: z.email().describe('The recipient email address'),
  subject: z.string().describe('The email subject line'),
  body: z.string().describe('The email body content (HTML or plain text)'),
  connectedAccountId: z
    .string()
    .refine((val) => isValidUuid(val))
    .describe(
      'The UUID of the connected account to send the email from. Provide this only if you have it; otherwise, leave blank.',
    )
    .optional(),
  files: z
    .array(workflowFileSchema)
    .describe('Array of file objects to attach to the email')
    .optional()
    .default([]),
});
