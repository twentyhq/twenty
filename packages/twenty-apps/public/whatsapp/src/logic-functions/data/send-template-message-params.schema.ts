import { z } from 'zod';

export const templateParameterSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.string(),
});

export const sendTemplateMessageParamsSchema = z.object({
  templateId: z.string().min(1),
  phoneNumberId: z.string().min(1).optional(),
  to: z.string().min(1),
  parameters: z.array(templateParameterSchema).default([]),
});

export type TemplateParameterInput = z.infer<typeof templateParameterSchema>;
