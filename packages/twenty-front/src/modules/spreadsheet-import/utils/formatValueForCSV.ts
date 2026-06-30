import { isString } from '@sniptt/guards';

// Formats values for CSV output by wrapping in quotes when needed and escaping internal quotes.
// This handles CSV formatting requirements (commas, quotes, newlines) but NOT security issues.
// For security (CSV injection prevention), use sanitizeValueForCSVExport() BEFORE this function.
export const formatValueForCSV = (value: any) => {
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
