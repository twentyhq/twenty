import { type FormFieldInputSettings } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSettings';
import { FieldMetadataType } from 'twenty-shared/types';

export const getRecordFormFieldInputSettings = (
  fieldType: FieldMetadataType,
): FormFieldInputSettings | undefined =>
  fieldType === FieldMetadataType.CURRENCY
    ? { type: FieldMetadataType.CURRENCY, amountUnit: 'units' }
    : undefined;
