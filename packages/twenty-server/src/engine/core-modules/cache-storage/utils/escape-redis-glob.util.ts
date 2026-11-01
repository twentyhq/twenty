export const escapeRedisGlob = (value: string): string =>
  value.replace(/[\\*?[\]]/g, '\\$&');
