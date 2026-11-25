export const escapeSqlLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, (wildcard) => `\\${wildcard}`);
