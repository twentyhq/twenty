import { z } from 'zod';

import { absoluteUrlSchema } from '~/utils/validation-schemas/absoluteUrlSchema';

import { FieldLinksValue } from '../FieldMetadata';

export const linksSchema = z.object({
  primaryLinkLabel: z.string(),
  primaryLinkUrl: absoluteUrlSchema,
  secondaryLinks: z
    .array(z.object({ label: z.string(), url: absoluteUrlSchema }))
    .nullable(),
}) satisfies z.ZodType<FieldLinksValue>;

export const isFieldLinksValue = (
  fieldValue: unknown,
): fieldValue is FieldLinksValue => linksSchema.safeParse(fieldValue).success;
