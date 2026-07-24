import { extractImportantPriorityFromCssValue } from '@/utils/extractImportantPriorityFromCssValue';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';

export const parseCssTextIntoStyleDeclarations = (
  cssText: string,
): {
  cssValueByStoreKey: Record<string, string>;
  importantPriorityStoreKeys: Set<string>;
} => {
  const cssValueByStoreKey: Record<string, string> = {};
  const importantPriorityStoreKeys = new Set<string>();

  for (const declaration of splitCssDeclarations(cssText)) {
    const propertyNameEndIndex = declaration.indexOf(':');

    if (propertyNameEndIndex <= 0) {
      continue;
    }

    const storeKey = declaration.slice(0, propertyNameEndIndex).trim();

    const { cssValueWithoutImportantPriority, hasImportantPriority } =
      extractImportantPriorityFromCssValue(
        declaration.slice(propertyNameEndIndex + 1).trim(),
      );

    if (storeKey === '' || cssValueWithoutImportantPriority === '') {
      continue;
    }

    const wouldDowngradeExistingImportantPriority =
      importantPriorityStoreKeys.has(storeKey) && !hasImportantPriority;

    if (wouldDowngradeExistingImportantPriority) {
      continue;
    }

    cssValueByStoreKey[storeKey] = cssValueWithoutImportantPriority;

    if (hasImportantPriority) {
      importantPriorityStoreKeys.add(storeKey);
    } else {
      importantPriorityStoreKeys.delete(storeKey);
    }
  }

  return { cssValueByStoreKey, importantPriorityStoreKeys };
};
