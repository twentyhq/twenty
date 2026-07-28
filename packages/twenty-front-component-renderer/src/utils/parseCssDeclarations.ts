import { type CssDeclaration } from '@/types/CssDeclaration';
import { normalizeCssPropertyName } from '@/utils/normalizeCssPropertyName';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';
import { stripImportantPriorityFromCssValue } from '@/utils/stripImportantPriorityFromCssValue';

export const parseCssDeclarations = (cssText: string): CssDeclaration[] => {
  const declarationsByNormalizedCssPropertyName = new Map<
    string,
    CssDeclaration
  >();
  const importantNormalizedCssPropertyNames = new Set<string>();

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

    const normalizedCssPropertyName = normalizeCssPropertyName(cssPropertyName);
    const hasImportantPriority = cssValue !== rawCssValue;

    if (
      !hasImportantPriority &&
      importantNormalizedCssPropertyNames.has(normalizedCssPropertyName)
    ) {
      continue;
    }

    if (hasImportantPriority) {
      importantNormalizedCssPropertyNames.add(normalizedCssPropertyName);
    }

    declarationsByNormalizedCssPropertyName.set(normalizedCssPropertyName, {
      cssPropertyName,
      cssValue,
    });
  }

  return [...declarationsByNormalizedCssPropertyName.values()];
};
