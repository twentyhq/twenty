import { CSS_IMPORTANT_PRIORITY_PATTERN } from '@/constants/CssImportantPriorityPattern';

export const extractImportantPriorityFromCssValue = (
  rawCssValue: string,
): {
  cssValueWithoutImportantPriority: string;
  hasImportantPriority: boolean;
} => {
  const hasImportantPriority = CSS_IMPORTANT_PRIORITY_PATTERN.test(rawCssValue);

  const cssValueWithoutImportantPriority = hasImportantPriority
    ? rawCssValue.replace(CSS_IMPORTANT_PRIORITY_PATTERN, '').trim()
    : rawCssValue;

  return { cssValueWithoutImportantPriority, hasImportantPriority };
};
