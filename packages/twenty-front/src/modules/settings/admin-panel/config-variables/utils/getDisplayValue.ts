export const getDisplayValue = (
  value: string | number | boolean | string[] | null,
): string => {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};
