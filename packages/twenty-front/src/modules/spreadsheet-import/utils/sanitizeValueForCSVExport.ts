import { CSV_DANGEROUS_CHARACTERS } from '@/spreadsheet-import/constants/CsvDangerousCharacters';
import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/constants/CsvInjectionPreventionZwj';

export const sanitizeValueForCSVExport = (value: any): string => {
  if (value == null) return '';

  const stringValue = typeof value === 'string' ? value : String(value);

  if (CSV_DANGEROUS_CHARACTERS.test(stringValue)) {
    return CSV_INJECTION_PREVENTION_ZWJ + stringValue;
  }

  return stringValue;
};
