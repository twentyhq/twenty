import { z } from 'zod';
import { FieldLinksValue } from '../FieldMetadata';

export const linksSchema = z.object({
  primaryLinkLabel: z.string().nullable(),
  primaryLinkUrl: z.string().nullable(),
  secondaryLinks: z
    .array(
      z.object({
        label: z.string().nullable(),
        url: z.string().nullable(),
      }),
    )
    .nullable(),
}) satisfies z.ZodType<FieldLinksValue>;

export const isFieldLinksValue = (
  fieldValue: unknown,
): fieldValue is FieldLinksValue => linksSchema.safeParse(fieldValue).success;
