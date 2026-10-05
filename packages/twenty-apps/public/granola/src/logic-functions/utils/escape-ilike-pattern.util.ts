export const escapeIlikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');
