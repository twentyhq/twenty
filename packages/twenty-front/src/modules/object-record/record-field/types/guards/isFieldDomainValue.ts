import { z } from 'zod';

import { FieldDomainValue } from '../FieldMetadata';

const domainSchema = z.object({
  primaryLink: z.string(),
  secondaryLinks: z.array(z.string()).optional().nullable(),
}) satisfies z.ZodType<FieldDomainValue>;

export const isFieldDomainValue = (
  fieldValue: unknown,
): fieldValue is FieldDomainValue => domainSchema.safeParse(fieldValue).success;
