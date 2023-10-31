import { z } from 'zod';

import { FieldURLV2Value } from '../FieldMetadata';

const urlV2Schema = z.object({
  link: z.string(),
  text: z.string(),
});

// TODO: add zod
export const isFieldURLV2Value = (
  fieldValue: unknown,
): fieldValue is FieldURLV2Value => urlV2Schema.safeParse(fieldValue).success;
