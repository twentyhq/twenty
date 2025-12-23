import { isString } from '@sniptt/guards';

import { type FieldTextValue } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldTextValue = (
  fieldValue: unknown,
): fieldValue is FieldTextValue => isString(fieldValue);
