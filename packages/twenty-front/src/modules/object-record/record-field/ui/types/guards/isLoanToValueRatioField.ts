import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

// Scoped to this one field so the LTV warning color doesn't affect other percent fields.
export const isLoanToValueRatioField = (
  field: Pick<FieldDefinition<FieldMetadata>, 'metadata'>,
): boolean =>
  field.metadata.objectMetadataNameSingular ===
    CoreObjectNameSingular.Opportunity &&
  field.metadata.fieldName === 'loanToValueRatio';
