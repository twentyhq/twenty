import { z } from 'zod';

const templateParameterSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.string(),
});

const templateHeaderMediaSchema = z
  .object({
    type: z.enum(['image', 'video', 'document']),
    filename: z.string().min(1).optional(),
  })
  .and(z.union([z.object({ link: z.url() }), z.object({ id: z.string().min(1) })]));

const templateButtonParameterSchema = z.object({
  index: z.number().int().min(0).max(9),
  subType: z.enum(['quick_reply', 'url', 'copy_code']),
  value: z.string().min(1),
});

export const sendTemplateMessageParamsSchema = z
  .object({
    templateId: z.string().min(1),
    phoneNumberId: z.string().min(1).optional(),
    to: z.string().min(1),
    parameters: z.array(templateParameterSchema).default([]),
    headerParameters: z.array(templateParameterSchema).default([]),
    headerMedia: templateHeaderMediaSchema.optional(),
    buttonParameters: z.array(templateButtonParameterSchema).default([]),
  })
  .refine(
    ({ headerParameters, headerMedia }) => headerParameters.length === 0 || headerMedia === undefined,
    { message: 'A header takes either text parameters or media, not both', path: ['headerMedia'] },
  );
