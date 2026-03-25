export const escapeForIlike = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');
