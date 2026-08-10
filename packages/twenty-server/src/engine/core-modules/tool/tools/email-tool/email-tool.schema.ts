import { emailDocumentSchema, isValidUuid } from 'twenty-shared/utils';
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
  body: z
    .union([emailDocumentSchema, z.string()])
    .describe(
      'The email body. Preferred: a structured email document ({type: "doc", content: [...]} with paragraph, heading, bulletList/orderedList, image, button, section, divider and html blocks), rendered to email-safe HTML server-side. An HTML string is also accepted. Campaign-style {{variables}} are not substituted in 1:1 emails.',
    ),
  connectedAccountId: z
    .string()
    .refine((val) => isValidUuid(val))
    .describe(
      'The UUID of the connected account to send the email from. Provide this only if you have it; otherwise use fromHandle, or leave both blank to use the default account.',
    )
    .optional(),
  fromHandle: z
    .string()
    .describe(
      'The email address to send from, e.g. "work@example.com". Resolved server-side to a connected account you are allowed to send from; the send fails listing the available addresses if it is not connected. Use this instead of connectedAccountId when you know the sender address but not its UUID. Ignored when connectedAccountId is provided.',
    )
    .optional(),
  files: z
    .array(workflowFileSchema)
    .describe('Array of file objects to attach to the email')
    .optional()
    .default([]),
  inReplyTo: z
    .string()
    .describe(
      'The RFC 2822 Message-ID of an existing email to reply to. When provided, the email is sent as a reply in the same thread.',
    )
    .optional(),
});
