import { type CssDeclaration } from '@/types/CssDeclaration';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';
import { stripImportantPriorityFromCssValue } from '@/utils/stripImportantPriorityFromCssValue';

export const parseCssDeclarations = (cssText: string): CssDeclaration[] => {
  const cssDeclarations: CssDeclaration[] = [];

  for (const declaration of splitCssDeclarations(cssText)) {
    const propertyNameEndIndex = declaration.indexOf(':');

    if (propertyNameEndIndex <= 0) {
      continue;
    }

    const cssPropertyName = declaration.slice(0, propertyNameEndIndex).trim();
    const cssValue = stripImportantPriorityFromCssValue(
      declaration.slice(propertyNameEndIndex + 1).trim(),
    );

    if (cssPropertyName === '' || cssValue === '') {
      continue;
    }

    cssDeclarations.push({ cssPropertyName, cssValue });
  }

  return cssDeclarations;
};
