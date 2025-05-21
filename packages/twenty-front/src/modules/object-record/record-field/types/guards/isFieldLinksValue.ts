import { absoluteUrlSchema } from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldLinksValue } from '../FieldMetadata';

export const linksSchema = z.object({
  primaryLinkLabel: z.string().nullable(),
  primaryLinkUrl: absoluteUrlSchema.or(z.string().length(0)).nullable(),
  secondaryLinks: z
    .array(
      z.object({
        label: z.string().nullable(),
        url: absoluteUrlSchema.nullable(),
      }),
    )
    .nullable(),
}) satisfies z.ZodType<FieldLinksValue>;

export const isFieldLinksValue = (
  fieldValue: unknown,
): fieldValue is FieldLinksValue => linksSchema.safeParse(fieldValue).success;
