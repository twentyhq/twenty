import { type CssDeclaration } from '@/types/CssDeclaration';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';
import { stripImportantPriorityFromCssValue } from '@/utils/stripImportantPriorityFromCssValue';

export const parseCssDeclarations = (cssText: string): CssDeclaration[] => {
  const declarationsByCssPropertyName = new Map<string, CssDeclaration>();
  const importantCssPropertyNames = new Set<string>();

  for (const declaration of splitCssDeclarations(cssText)) {
    const propertyNameEndIndex = declaration.indexOf(':');

    if (propertyNameEndIndex <= 0) {
      continue;
    }

    const cssPropertyName = declaration.slice(0, propertyNameEndIndex).trim();
    const rawCssValue = declaration.slice(propertyNameEndIndex + 1).trim();
    const cssValue = stripImportantPriorityFromCssValue(rawCssValue);

    if (cssPropertyName === '' || cssValue === '') {
      continue;
    }

    const hasImportantPriority = cssValue !== rawCssValue;

    if (
      !hasImportantPriority &&
      importantCssPropertyNames.has(cssPropertyName)
    ) {
      continue;
    }

    if (hasImportantPriority) {
      importantCssPropertyNames.add(cssPropertyName);
    }

    declarationsByCssPropertyName.set(cssPropertyName, {
      cssPropertyName,
      cssValue,
    });
  }

  return [...declarationsByCssPropertyName.values()];
};
