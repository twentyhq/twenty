import { camelToKebab } from 'twenty-shared/utils';

const isCssCustomPropertyName = (propertyName: string): boolean =>
  propertyName.startsWith('--');

export const resolveStyleStoreKeyFromPropertyName = (
  propertyName: string,
): string =>
  isCssCustomPropertyName(propertyName)
    ? propertyName
    : camelToKebab(propertyName);
