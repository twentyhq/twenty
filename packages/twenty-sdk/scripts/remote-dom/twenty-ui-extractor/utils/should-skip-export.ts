const SCREAMING_SNAKE_CASE_REGEX = /^[A-Z][A-Z_0-9]+$/;

const SKIP_PREFIXES = [
  'Styled',
  'use',
  'Icon',
  'Illustration',
  'base',
  'BASE',
  'get',
] as const;

const SKIP_SUFFIXES = ['Provider', 'State', 'state'] as const;

const NEVER_SKIP = new Set(['Icon']);

export const shouldSkipExport = (exportName: string): boolean => {
  if (NEVER_SKIP.has(exportName)) {
    return false;
  }

  const hasSkipPrefix = SKIP_PREFIXES.some((prefix) =>
    exportName.startsWith(prefix),
  );
  const hasSkipSuffix = SKIP_SUFFIXES.some((suffix) =>
    exportName.endsWith(suffix),
  );
  const isScreamingSnakeCase = SCREAMING_SNAKE_CASE_REGEX.test(exportName);

  return hasSkipPrefix || hasSkipSuffix || isScreamingSnakeCase;
};
