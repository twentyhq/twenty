import { isValidUuid } from 'twenty-shared/utils';
import { workflowFileSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

const EmailRecipientsZodSchema = z.object({
  to: z
    .string()
    .describe('Comma-separated recipient email addresses (To)')
    .default(''),
  cc: z
    .string()
    .describe('Comma-separated CC email addresses')
    .optional()
    .default(''),
  bcc: z
    .string()
    .describe('Comma-separated BCC email addresses')
    .optional()
    .default(''),
});

export const EmailToolInputZodSchema = z.object({
  recipients: EmailRecipientsZodSchema.describe(
    'Recipients object with to, cc, and bcc fields (comma-separated)',
  ),
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
