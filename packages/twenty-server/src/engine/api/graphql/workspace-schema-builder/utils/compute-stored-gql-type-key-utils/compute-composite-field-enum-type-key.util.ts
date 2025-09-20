import { pascalCase } from 'src/utils/pascal-case';

export const computeCompositeFieldEnumTypeKey = (
  fieldMetadataType: string,
  compositePropertyName: string,
): string => {
  return `${pascalCase(fieldMetadataType)}${pascalCase(
    compositePropertyName,
  )}Enum`;
};
