import { isDefined } from 'twenty-shared/utils';

const escapeCopyText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};

export const formatPgCopyField = (
  value: unknown,
  isJsonColumn = false,
): string => {
  if (!isDefined(value)) return '\\N';

  if (isJsonColumn) return escapeCopyText(JSON.stringify(value));

  if (typeof value === 'boolean') return value ? 't' : 'f';

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '\\N';

    return String(value);
  }

  if (typeof value === 'bigint') return String(value);

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    if (value.length === 0) return '{}';

    if (isDefined(value[0]) && typeof value[0] === 'object') {
      return escapeCopyText(JSON.stringify(value));
    }

    const formattedElements = value.map((element) => {
      if (!isDefined(element)) return 'NULL';

      const escapedElement = String(element)
        .replace(/\\/g, '\\\\')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      return `"${escapedElement}"`;
    });

    return `{${formattedElements.join(',')}}`;
  }

  if (typeof value === 'object') return escapeCopyText(JSON.stringify(value));

  return escapeCopyText(String(value));
};
