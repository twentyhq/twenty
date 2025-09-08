// Zero-Width Joiner character used to prevent CSV injection while preserving data.
// This invisible Unicode character breaks formula recognition in Excel/LibreOffice
// while keeping the original content visually identical to users.
export const CSV_INJECTION_PREVENTION_ZWJ = '\u200D';

// Characters that can trigger CSV injection when they appear at the start of a cell.
// Based on OWASP CSV Injection guidelines: https://owasp.org/www-community/attacks/CSV_Injection
export const CSV_DANGEROUS_CHARACTERS = /^[=+\-@\t\r]/;

export const sanitizeValueForCSVExport = (value: any): string => {
  if (value == null) return '';

  const stringValue = typeof value === 'string' ? value : String(value);

  if (CSV_DANGEROUS_CHARACTERS.test(stringValue)) {
    return CSV_INJECTION_PREVENTION_ZWJ + stringValue;
  }

  return stringValue;
};

export const cleanZWJFromImportedValue = (value: string): string => {
  if (typeof value !== 'string') return value;

  if (value.startsWith(CSV_INJECTION_PREVENTION_ZWJ)) {
    return value.substring(1);
  }

  return value;
};

export const containsCSVProtectionZWJ = (value: string): boolean => {
  return (
    typeof value === 'string' && value.includes(CSV_INJECTION_PREVENTION_ZWJ)
  );
};
