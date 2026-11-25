import { z } from 'zod';
import { isDefined } from 'twenty-sdk/utils';

const templateTextSchema = z.string().min(1);

export const createTemplateParamsSchema = z
  .object({
    whatsAppBusinessAccountId: z.string().min(1).optional(),
    name: z
      .string()
      .min(1)
      .max(512)
      .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores only'),
    language: z.string().min(1),
    category: z.enum(['UTILITY', 'MARKETING', 'AUTHENTICATION']),
    parameterFormat: z.enum(['POSITIONAL', 'NAMED']).default('POSITIONAL'),
    header: templateTextSchema.optional(),
    body: templateTextSchema,
    footer: templateTextSchema.optional(),
    bodyExamples: z
      .array(z.object({ name: z.string().min(1).optional(), example: z.string().min(1) }))
      .default([]),
  })
  .refine(
    ({ parameterFormat, bodyExamples }) =>
      parameterFormat === 'POSITIONAL' || bodyExamples.every(({ name }) => isDefined(name)),
    { message: 'Every body example needs a name for named parameters', path: ['bodyExamples'] },
  );
