import { CSV_INJECTION_PREVENTION_ZWJ } from 'twenty-shared/constants';

export const cleanZWJFromImportedValue = (value: string): string => {
  if (typeof value !== 'string') return value;

  if (value.startsWith(CSV_INJECTION_PREVENTION_ZWJ)) {
    return value.substring(1);
  }

  return value;
};
