import { isString } from '@sniptt/guards';

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
