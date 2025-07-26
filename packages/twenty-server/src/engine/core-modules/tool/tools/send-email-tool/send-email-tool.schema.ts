import { z } from 'zod';

export const SendEmailInputZodSchema = z.object({
  email: z.string().email().describe('The recipient email address'),
  subject: z.string().describe('The email subject line'),
  body: z.string().describe('The email body content (HTML or plain text)'),
  connectedAccountId: z
    .string()
    .uuid()
    .describe(
      'The UUID of the connected account to send the email from. Provide this only if you have it; otherwise, leave blank.',
    )
    .optional(),
});

export const SendEmailToolParametersZodSchema = z.object({
  toolDescription: z
    .string()
    .describe(
      "A clear, human-readable status message describing the email being sent. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update (e.g., 'Sending email to customer about order status'). Explain what email you are sending and to whom in natural language.",
    ),
  input: SendEmailInputZodSchema,
});
