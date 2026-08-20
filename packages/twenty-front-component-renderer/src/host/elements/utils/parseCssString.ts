import { isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';
import { kebabToCamelCase } from 'twenty-shared/utils';

import { isCssCustomPropertyName } from '@/utils/css/isCssCustomPropertyName';
import { parseCssDeclarations } from '@/utils/css/parseCssDeclarations';

export const parseCssString = (
  styleString: string | undefined,
): CSSProperties | undefined => {
  if (!isNonEmptyString(styleString)) {
    return undefined;
  }

  const reactStyleProperties: Record<string, string> = {};

  for (const { cssPropertyName, cssValue } of parseCssDeclarations(
    styleString,
  )) {
    const reactStylePropertyName = isCssCustomPropertyName(cssPropertyName)
      ? cssPropertyName
      : kebabToCamelCase(cssPropertyName);

    reactStyleProperties[reactStylePropertyName] = cssValue;
  }

  return reactStyleProperties;
};
