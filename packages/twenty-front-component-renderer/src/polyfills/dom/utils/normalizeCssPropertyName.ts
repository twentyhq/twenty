import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';

export const normalizeCssPropertyName = (cssPropertyName: string): string =>
  isCssCustomPropertyName(cssPropertyName)
    ? cssPropertyName
    : cssPropertyName.toLowerCase();
