import { isNonEmptyString } from '@sniptt/guards';

import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const formatFullNameFieldValue = (
  fieldValue: Partial<FieldFullNameValue> | null | undefined,
) =>
  [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');
