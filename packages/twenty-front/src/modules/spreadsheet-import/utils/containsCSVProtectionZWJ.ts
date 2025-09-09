import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/constants/CsvInjectionPreventionZwj';

export const containsCSVProtectionZWJ = (value: string): boolean => {
  return (
    typeof value === 'string' && value.includes(CSV_INJECTION_PREVENTION_ZWJ)
  );
};
