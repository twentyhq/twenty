import { z } from 'zod';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAdditionalPhones } from '@/object-record/record-field/ui/utils/normalizeAdditionalPhones';
import { isDefined } from 'twenty-shared/utils';

export const phonesFieldValueSchema = z.object({
  primaryPhoneNumber: z.string(),
  primaryPhoneCountryCode: z.string(),
  primaryPhoneCallingCode: z.string().optional(),
  additionalPhones: z.preprocess(
    (additionalPhones) =>
      isDefined(additionalPhones)
        ? normalizeAdditionalPhones(additionalPhones)
        : additionalPhones,
    z
      .array(
        z.object({
          number: z.string(),
          callingCode: z.string(),
          countryCode: z.string(),
        }),
      )
      .nullish(),
  ),
}) satisfies z.ZodType<FieldPhonesValue>;
