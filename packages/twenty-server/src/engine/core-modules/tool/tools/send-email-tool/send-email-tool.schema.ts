import { isValidUuid } from 'twenty-shared/utils';
import { workflowFileSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

export const EmailRecipientsZodSchema = z.object({
  to: z
    .array(z.string())
    .describe('Array of recipient email addresses (To)')
    .default([]),
  cc: z
    .array(z.string())
    .describe('Array of CC email addresses')
    .optional()
    .default([]),
  bcc: z
    .array(z.string())
    .describe('Array of BCC email addresses')
    .optional()
    .default([]),
});

export const SendEmailInputZodSchema = z
  .object({
    email: z
      .email()
      .describe('The recipient email address (legacy, use recipients instead)')
      .optional(),
    recipients: EmailRecipientsZodSchema.describe(
      'Recipients object with to, cc, and bcc arrays',
    ).optional(),
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
  })
  .refine(
    (data) =>
      data.email ||
      (data.recipients && data.recipients.to && data.recipients.to.length > 0),
    {
      message:
        'Either email or recipients.to must be provided with at least one recipient',
    },
  );
