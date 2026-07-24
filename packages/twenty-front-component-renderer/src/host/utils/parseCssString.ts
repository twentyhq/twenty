import { isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';
import { kebabToCamelCase } from 'twenty-shared/utils';

import { extractImportantPriorityFromCssValue } from '@/utils/extractImportantPriorityFromCssValue';
import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';

export const parseCssString = (
  styleString: string | undefined,
): CSSProperties | undefined => {
  if (!isNonEmptyString(styleString)) {
    return styleString as CSSProperties | undefined;
  }

  const reactStyleProperties: Record<string, string> = {};

  for (const declaration of splitCssDeclarations(styleString)) {
    const propertyNameEndIndex = declaration.indexOf(':');

    if (propertyNameEndIndex <= 0) {
      continue;
    }

    const cssPropertyName = declaration.slice(0, propertyNameEndIndex).trim();

    const { cssValueWithoutImportantPriority } =
      extractImportantPriorityFromCssValue(
        declaration.slice(propertyNameEndIndex + 1).trim(),
      );

    const reactStylePropertyName = isCssCustomPropertyName(cssPropertyName)
      ? cssPropertyName
      : kebabToCamelCase(cssPropertyName);

    reactStyleProperties[reactStylePropertyName] =
      cssValueWithoutImportantPriority;
  }

  return reactStyleProperties;
};
