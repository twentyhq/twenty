import { normalizeWhitespace } from './normalizeWhitespace';

export const normalizeCronExpression = (expression: string): string => {
  let normalized = normalizeWhitespace(expression);

  normalized = normalized.replace(/(^|\s)\/(\d+)/g, '$1*/$2');

  const parts = normalized.split(/\s+/);

  if (parts.length === 4) {
    return `0 ${normalized}`;
  } else if (parts.length === 5) {
    return normalized;
  } else if (parts.length === 6) {
    return parts.slice(1).join(' ');
  }

  return normalized;
};
