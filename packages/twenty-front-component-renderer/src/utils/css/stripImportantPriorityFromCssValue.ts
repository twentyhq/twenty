const CSS_IMPORTANT_PRIORITY_PATTERN = /\s*!\s*important\s*$/i;

export const stripImportantPriorityFromCssValue = (
  rawCssValue: string,
): string => rawCssValue.replace(CSS_IMPORTANT_PRIORITY_PATTERN, '');
