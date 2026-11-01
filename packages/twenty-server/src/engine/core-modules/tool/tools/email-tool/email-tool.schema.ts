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
      'TipTap JSON (editor.getJSON() format). Example: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hi Alice,"}]},{"type":"paragraph"},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Point","marks":[{"type":"bold"}]}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Site","marks":[{"type":"link","attrs":{"href":"https://twenty.com"}}]}]}]}. Rules: doc.content holds only blocks: paragraph, heading (attrs.level 1, 2 or 3), bulletList, orderedList, image (attrs.src). Each listItem holds a paragraph. Text nodes go inside paragraph or heading and are never empty; a blank line is {"type":"paragraph"}, a line break is {"type":"hardBreak"}. Marks are objects: bold, italic, underline, strike, link (attrs.href). Not supported: blockquote, codeBlock, horizontalRule. Write real values: {{...}} placeholders are sent literally. A string is also accepted: HTML markup is sent as-is, anything else as plain text.',
    ),
  connectedAccountId: z
    .string()
    .refine((val) => isValidUuid(val))
    .describe(
      'The UUID of the connected account to send the email from. When the user has not said which address to send from, call find_connected_accounts first: if it returns exactly one account use that id, and if it returns several ask the user which one before sending. Leave blank only when no account id could be determined.',
    )
    .optional(),
  fromHandle: z
    .string()
    .describe(
      'The address to send from. Must be the connected account handle or one of its verified aliases. Leave blank to send from the connected account handle.',
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
