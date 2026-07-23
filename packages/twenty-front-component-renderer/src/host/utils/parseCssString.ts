import { isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';
import { kebabToCamelCase } from 'twenty-shared/utils';

import { CSS_IMPORTANT_PRIORITY_PATTERN } from '@/constants/CssImportantPriorityPattern';
import { splitCssDeclarations } from '@/utils/splitCssDeclarations';

export const parseCssString = (
  styleString: string | undefined,
): CSSProperties | undefined => {
  if (!isNonEmptyString(styleString)) {
    return styleString as CSSProperties | undefined;
  }

  const style: Record<string, string> = {};

  for (const declaration of splitCssDeclarations(styleString)) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }

    const property = declaration.slice(0, colonIndex).trim();
    // React style objects cannot carry a priority, and CSSOM rejects values
    // that keep the "!important" suffix, so the priority is stripped.
    const value = declaration
      .slice(colonIndex + 1)
      .trim()
      .replace(CSS_IMPORTANT_PRIORITY_PATTERN, '');

    const isCssCustomProperty = property.startsWith('--');

    const key = isCssCustomProperty ? property : kebabToCamelCase(property);

    style[key] = value;
  }

  return style;
};
