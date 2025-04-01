import { absoluteUrlSchema } from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldLinksValue } from '../FieldMetadata';

export const linksSchema = z.object({
  primaryLinkLabel: z.string(),
  primaryLinkUrl: absoluteUrlSchema.or(z.string().length(0)),
  secondaryLinks: z
    .array(z.object({ label: z.string(), url: absoluteUrlSchema }))
    .nullable(),
}) satisfies z.ZodType<FieldLinksValue>;

export const isFieldLinksValue = (
  fieldValue: unknown,
): fieldValue is FieldLinksValue => linksSchema.safeParse(fieldValue).success;
