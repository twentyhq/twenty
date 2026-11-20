import { z } from 'zod';

const templateTextSchema = z.string().min(1);

export const editTemplateParamsSchema = z
  .object({
    templateId: z.string().min(1),
    category: z.enum(['UTILITY', 'MARKETING', 'AUTHENTICATION']).optional(),
    header: templateTextSchema.optional(),
    body: templateTextSchema.optional(),
    footer: templateTextSchema.optional(),
    bodyExamples: z
      .array(z.object({ name: z.string().min(1).optional(), example: z.string().min(1) }))
      .default([]),
  })
  .refine(({ category, body }) => category !== undefined || body !== undefined, {
    message: 'Pass a new category, a new body, or both',
  })
  .refine(({ body, header, footer }) => body !== undefined || (header === undefined && footer === undefined), {
    message: 'Changing the header or footer needs the body too, since the content is replaced as a whole',
    path: ['body'],
  });
