import { CSV_INJECTION_PREVENTION_ZWJ } from 'twenty-shared/constants';

export const containsCSVProtectionZWJ = (value: string): boolean => {
  return (
    typeof value === 'string' && value.includes(CSV_INJECTION_PREVENTION_ZWJ)
  );
};
