import { DateDisplayFormat } from 'twenty-shared/types';

export const isDateFieldCustomDisplayFormat = (
  displayFormat: DateDisplayFormat,
): displayFormat is DateDisplayFormat =>
  displayFormat === DateDisplayFormat.CUSTOM;
