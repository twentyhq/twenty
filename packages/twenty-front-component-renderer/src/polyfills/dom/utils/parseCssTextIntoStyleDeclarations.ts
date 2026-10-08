import { normalizeCssPropertyName } from '@/utils/css/normalizeCssPropertyName';
import { parseCssDeclarations } from '@/utils/css/parseCssDeclarations';

export const parseCssTextIntoStyleDeclarations = (
  cssText: string,
): Record<string, string> => {
  const cssValueByCssPropertyName: Record<string, string> = {};

  for (const { cssPropertyName, cssValue } of parseCssDeclarations(cssText)) {
    cssValueByCssPropertyName[normalizeCssPropertyName(cssPropertyName)] =
      cssValue;
  }

  return cssValueByCssPropertyName;
};
