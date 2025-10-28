import { FieldDateDisplayFormat } from '../FieldMetadata';

export const isDateFieldCustomDisplayFormat = (
  displayFormat: FieldDateDisplayFormat,
): displayFormat is FieldDateDisplayFormat =>
  displayFormat === FieldDateDisplayFormat.CUSTOM;
