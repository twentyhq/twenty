import { pascalCase } from 'src/utils/pascal-case';

export const computeEnumFieldGqlTypeKey = (
  objectMetadataName: string,
  fieldMetadataName: string,
): string => {
  return `${pascalCase(objectMetadataName)}${pascalCase(
    fieldMetadataName,
  )}Enum`;
};
