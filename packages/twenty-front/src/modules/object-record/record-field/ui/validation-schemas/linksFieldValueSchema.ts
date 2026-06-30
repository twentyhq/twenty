import { z } from 'zod';

import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const linksFieldValueSchema = z.object({
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
