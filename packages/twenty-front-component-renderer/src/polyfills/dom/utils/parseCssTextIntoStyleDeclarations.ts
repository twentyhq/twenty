import { normalizeCssPropertyName } from '@/polyfills/dom/utils/normalizeCssPropertyName';
import { parseCssDeclarations } from '@/utils/parseCssDeclarations';

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
