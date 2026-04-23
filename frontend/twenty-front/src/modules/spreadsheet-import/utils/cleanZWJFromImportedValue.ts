import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/constants/CsvInjectionPreventionZwj';

export const cleanZWJFromImportedValue = (value: string): string => {
  if (typeof value !== 'string') return value;

  if (value.startsWith(CSV_INJECTION_PREVENTION_ZWJ)) {
    return value.substring(1);
  }

  return value;
};
