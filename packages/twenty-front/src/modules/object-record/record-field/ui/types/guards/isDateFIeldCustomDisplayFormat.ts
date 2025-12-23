import { FieldDateDisplayFormat } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isDateFieldCustomDisplayFormat = (
  displayFormat: FieldDateDisplayFormat,
): displayFormat is FieldDateDisplayFormat =>
  displayFormat === FieldDateDisplayFormat.CUSTOM;
