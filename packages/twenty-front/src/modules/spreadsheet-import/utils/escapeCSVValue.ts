import { isString } from '@sniptt/guards';

// Escapes CSV values for proper formatting by wrapping in quotes and escaping internal quotes.
// This handles CSV formatting requirements (commas, quotes, newlines) but NOT security issues.
// For security (CSV injection prevention), use sanitizeValueForCSVExport() BEFORE this function.
export const escapeCSVValue = (value: any) => {
  if (value == null) return '';

  const stringValue = isString(value) ? value : JSON.stringify(value);

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};
