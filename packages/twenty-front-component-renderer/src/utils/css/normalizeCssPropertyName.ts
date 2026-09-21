import { isCssCustomPropertyName } from '@/utils/css/isCssCustomPropertyName';

export const normalizeCssPropertyName = (cssPropertyName: string): string =>
  isCssCustomPropertyName(cssPropertyName)
    ? cssPropertyName
    : cssPropertyName.toLowerCase();
